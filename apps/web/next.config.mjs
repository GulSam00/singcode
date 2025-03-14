import { withTamagui } from '@tamagui/next-plugin';

export default withTamagui({
  reactStrictMode: true,
  tamaguiOptions: {
    config: './tamagui.config.ts',
    components: ['tamagui'],
    disableExtraction: process.env.NODE_ENV === 'development',
  },
});
