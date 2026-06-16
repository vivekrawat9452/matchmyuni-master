import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {colors} from '../../../../utils/colors';

type Props = {
  value: boolean;
  onValueChange: (v: boolean) => void;
};

/** Figma notification toggle — 51×31, on=#3CC09F off=#D9D9D9 */
export function ProfileToggle({value, onValueChange}: Props) {
  return (
    <Pressable onPress={() => onValueChange(!value)} hitSlop={8}>
      <View style={[styles.track, value && styles.trackOn]}>
        <View style={[styles.thumb, value && styles.thumbOn]} />
      </View>
    </Pressable>
  );
}

const TRACK_W = 51;
const TRACK_H = 31;
const THUMB = 27;

const styles = StyleSheet.create({
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    backgroundColor: colors.switchOff,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  trackOn: {backgroundColor: colors.accentTeal},
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbOn: {alignSelf: 'flex-end'},
});
