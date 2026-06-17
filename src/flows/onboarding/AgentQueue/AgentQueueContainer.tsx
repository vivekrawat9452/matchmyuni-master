import React, {useCallback} from 'react';
import {Linking} from 'react-native';
import {AgentQueueScreen} from './AgentQueueScreen';
import {agentHomeStatic} from '../../agent/agentAssets';

export function AgentQueueContainer() {
  const onContactSupport = useCallback(() => {
    void Linking.openURL(`mailto:${agentHomeStatic.accountManager.email}`);
  }, []);

  return <AgentQueueScreen onContactSupport={onContactSupport} />;
}
