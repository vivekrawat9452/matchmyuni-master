#!/usr/bin/env python3
"""Extract individual student-flow screens from the local Figma design dump.

No Figma API calls — reads only assets/studentflow/figma/full_design_dump.json
and the screen index in student_flow_screen_map.json.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DUMP_PATH = ROOT / "assets/studentflow/figma/full_design_dump.json"
MAP_PATH = ROOT / "assets/studentflow/figma/student_flow_screen_map.json"
OUT_DIR = ROOT / "assets/studentflow/figma/screens"


def load_json(path: Path) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def find_node(node: dict, target_id: str) -> dict | None:
    if node.get("id") == target_id:
        return node
    for child in node.get("children") or []:
        found = find_node(child, target_id)
        if found:
            return found
    return None


def normalize_node_id(value: str) -> str:
    value = value.strip()
    if "-" in value and ":" not in value:
        page, node = value.split("-", 1)
        return f"{page}:{node}"
    return value


def iter_map_screens(screen_map: dict):
    for flow in screen_map.get("flows", []):
        for screen in flow.get("screens", []):
            yield flow["flow"], screen


def resolve_screen(screen_map: dict, *, node: str | None, key: str | None, flow: str | None):
    if node:
        node_id = normalize_node_id(node)
        by_node = screen_map.get("by_node_id", {})
        if node_id not in by_node:
            return None, node_id
        export_file = by_node[node_id]["export_file"]
        return {"node_id": node_id, "export_file": export_file, **by_node[node_id]}, node_id

    if key:
        normalized = key.replace(".", "_")
        for flow_name, screen in iter_map_screens(screen_map):
            screen_key = screen.get("key", "")
            if screen_key == normalized or screen_key == key:
                return screen, screen["node_id"]
        return None, key

    if flow:
        screens = []
        for flow_name, screen in iter_map_screens(screen_map):
            if flow_name == flow:
                screens.append(screen)
        return screens, flow

    return None, None


def extract_node(document: dict, node_id: str) -> dict | None:
    return find_node(document, node_id)


def write_screen(node_id: str, node: dict, export_file: str, out_dir: Path) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / export_file
    payload = {"nodes": {node_id: {"document": node}}}
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
    return out_path


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--node", help="Figma node id, e.g. 402:4486 or 402-4486")
    parser.add_argument("--key", help="Screen key from map, e.g. discover_home_1_0")
    parser.add_argument("--flow", help="Extract every screen in a flow, e.g. discover_home")
    parser.add_argument("--list", action="store_true", help="List all mapped screens")
    parser.add_argument(
        "--out-dir",
        default=str(OUT_DIR),
        help=f"Output directory (default: {OUT_DIR.relative_to(ROOT)})",
    )
    args = parser.parse_args()

    if not MAP_PATH.exists():
        print(f"Missing screen map: {MAP_PATH}", file=sys.stderr)
        return 1
    if not DUMP_PATH.exists():
        print(f"Missing design dump: {DUMP_PATH}", file=sys.stderr)
        return 1

    screen_map = load_json(MAP_PATH)

    if args.list:
        for flow_name, screen in iter_map_screens(screen_map):
            status = "ok" if screen.get("in_dump") else "missing"
            print(
                f"{screen.get('key'):<35} {screen['node_id']:<12} "
                f"[{status}] {screen.get('label', '')[:60]}"
            )
        return 0

    if not any([args.node, args.key, args.flow]):
        parser.print_help()
        return 1

    dump = load_json(DUMP_PATH)
    document = dump["document"]
    out_dir = Path(args.out_dir)

    resolved, lookup = resolve_screen(screen_map, node=args.node, key=args.key, flow=args.flow)

    if args.flow:
        if not resolved:
            print(f"No screens found for flow: {lookup}", file=sys.stderr)
            return 1
        extracted = 0
        for screen in resolved:
            node_id = screen["node_id"]
            node = extract_node(document, node_id)
            if not node:
                print(f"SKIP missing in dump: {node_id} ({screen.get('label')})")
                continue
            out_path = write_screen(node_id, node, screen["export_file"], out_dir)
            print(f"Wrote {out_path.relative_to(ROOT)}")
            extracted += 1
        print(f"Extracted {extracted}/{len(resolved)} screens for flow '{lookup}'")
        return 0 if extracted else 1

    if not resolved:
        print(f"Screen not found in map: {lookup}", file=sys.stderr)
        return 1

    node_id = resolved["node_id"]
    node = extract_node(document, node_id)
    if not node:
        print(f"Node {node_id} is mapped but missing from dump", file=sys.stderr)
        return 1

    export_file = resolved.get("export_file") or f"node_{node_id.replace(':', '_')}.json"
    out_path = write_screen(node_id, node, export_file, out_dir)
    print(f"Wrote {out_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
