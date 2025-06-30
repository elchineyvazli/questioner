// next.config.js
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'tronweb': 'commonjs tronweb',
        '@aws-sdk/client-s3': 'commonjs @aws-sdk/client-s3'
      });
    }
    config.resolve.fallback = { 
      fs: false, 
      path: false,
      crypto: require.resolve('crypto-browserify') 
    };
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['tronweb', '@aws-sdk/client-s3'],
  }
};

module.exports = nextConfig;