export default {
    alias: {
        $: './src',
        $data: './src/data',
        $components: './src/components',
        $layouts: './src/layouts',
    },
    plugins: ['@snowpack/plugin-typescript', '@snowpack/plugin-sass'],
};
