import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Platform,
} from 'react-native';

const MAX_LOGS = 80;

type LogEntry = {
  id: number;
  type: 'log' | 'warn' | 'error';
  msg: string;
  time: string;
};

let _addLog: ((e: LogEntry) => void) | null = null;
let _counter = 0;

const patchConsole = () => {
  const patch = (type: LogEntry['type'], orig: (...a: any[]) => void) =>
    (...args: any[]) => {
      orig(...args);
      const msg = args
        .map(a =>
          typeof a === 'object'
            ? JSON.stringify(a, null, 2)
            : String(a)
        )
        .join(' ');
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
      _addLog?.({ id: _counter++, type, msg, time });
    };

  console.log   = patch('log',   console.log);
  console.warn  = patch('warn',  console.warn);
  console.error = patch('error', console.error);
};

patchConsole();

export const DebugOverlay = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [visible, setVisible] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    _addLog = (entry) => {
      setLogs(prev => {
        const next = [...prev, entry];
        return next.length > MAX_LOGS
          ? next.slice(next.length - MAX_LOGS)
          : next;
      });
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 50);
    };
    return () => { _addLog = null; };
  }, []);

  if (!visible) return null;

  const colors: Record<LogEntry['type'], string> = {
    log:   '#ccc',
    warn:  '#f5a623',
    error: '#e74c3c',
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.panel}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🐛 Debug ({logs.length})</Text>
          <View style={styles.headerBtns}>
            <TouchableOpacity onPress={() => setMinimized(m => !m)} style={styles.btn}>
              <Text style={styles.btnText}>{minimized ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLogs([])} style={styles.btn}>
              <Text style={styles.btnText}>✕</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setVisible(false)} style={styles.btn}>
              <Text style={styles.btnText}>✖</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logs */}
        {!minimized && (
          <ScrollView ref={scrollRef} style={styles.scroll} keyboardShouldPersistTaps="always">
            {logs.length === 0 && (
              <Text style={{ color: '#555', fontSize: 11, padding: 8 }}>
                Логи появятся здесь...
              </Text>
            )}
            {logs.map(entry => (
              <View key={entry.id} style={styles.logRow}>
                <Text style={[styles.time]}>{entry.time}</Text>
                <Text
                  style={[styles.logText, { color: colors[entry.type] }]}
                  selectable
                >
                  {entry.msg}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    zIndex: 99999,
    elevation: 99999,
    paddingHorizontal: 8,
},
  panel: {
    backgroundColor: 'rgba(0,0,0,0.88)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: '#fff',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  headerBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  btnText: {
    color: '#aaa',
    fontSize: 12,
  },
  scroll: {
    maxHeight: 220,
  },
  logRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1a1a1a',
    gap: 6,
  },
  time: {
    color: '#555',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 1,
    minWidth: 58,
  },
  logText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1,
  },
});