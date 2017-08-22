const webpack = require('webpack')
const path = require('path')
const htmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: {
        index: ['./src/js/index.js', './src/index.html']
    },
    output: {
        filename: 'js/[name].js',
        path: path.resolve(__dirname, './dist/'),
        publicPath: '/dist'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader',
            include: path.resolve(__dirname, 'src'),
            exclude: path.resolve(__dirname, 'node_modules'),
            query: {
                presets: ['es2015']
            }
        }, {
                test: /\.html$/,
            loader: 'html-loader'
        }, {
            test: /\.css$/,
            use: [
                'style-loader',
                {
                    loader: 'css-loader',
                    options: {
                        importLoader: 1
                    }
                }, {
                    loader: 'postcss-loader',
                    options: {
                        plugins: (loader) => [
                            require('autoprefixer')()
                        ]
                    }
                }
            ]
        }, {
            test: /\.scss$/,
            use: [
                'style-loader',
                'css-loader',
                {
                    loader: 'postcss-loader',
                    options: {
                        plugins: (loader) => [
                            require('autoprefixer')()
                        ]
                    }
                },
                'sass-loader'
            ]
        }, {
            test: /\.png|jpg|gif|svg$/i,
            use: [{
                loader: 'file-loader',
                options: {
                    name: 'img/[name]-[hash:6].[ext]'
                }
            }]
        }]
    },
    plugins: [
        new htmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/index.html',
            inject: 'body',
            title: '行星与飞船',
            minify: {
                removeComments: true,
                // collapseWhitespace: true
            },
            chunks: ['main', 'index']
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
        hot: true,
        inline: true,
        contentBase: './',
        clientLogLevel: "none"
    }
}