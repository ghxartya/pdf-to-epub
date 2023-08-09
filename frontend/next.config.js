/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	webpack: config => {
		config.module.rules.push({
			test: /\.node/,
			use: 'raw-loader'
		})

		return config
	},
	env: {
		API_URL: process.env.API_URL
	}
}

module.exports = nextConfig
