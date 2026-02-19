import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

type JuiceImageProps = {
  uri: string;
  emoji: string;
  size?: number;
};

export function JuiceImage({ uri, emoji, size = 72 }: JuiceImageProps) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <View style={[styles.fallback, { width: size, height: size }]}>
        <Text style={[styles.emoji, { fontSize: size * 0.4 }]}>{emoji}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.image, { width: size, height: size }]}
      onError={() => setErrored(true)}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  fallback: {
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
});
