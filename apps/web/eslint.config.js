import base from '@flyt/config/eslint';
import nextPlugin from '@next/eslint-plugin-next';

export default [...base, nextPlugin.flatConfig.coreWebVitals];
