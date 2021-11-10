/* jshint esversion: 6 */
/* globals  require, module, process, __dirname */

// Libs
const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const fs = require('fs');

// Plugins
const ManifestPlugin = require('webpack-manifest-plugin');
const ParentModule = require('parent-module');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const RemovePlugin = require('remove-files-webpack-plugin');

/**
 * CraftWebpackConfig class
 */
class CraftWebpackConfig {
    constructor(options = {}) {
        this.types = [
            'asset',
            'base',
            'lib',
            'vue',
        ];

        this.basePath = path.dirname(ParentModule());

        // env
        let assetEnvPath = path.join(this.basePath, './.env');
        let baseEnvPath = path.resolve(__dirname, './.env');

        // Check asset for env file or fall back to root env if it exists.
        this.envPath = fs.existsSync(assetEnvPath)
            ? assetEnvPath
            : (fs.existsSync(baseEnvPath) ? baseEnvPath : null);

        if (this.envPath) {
            require('dotenv').config({path: this.envPath});
        }

        this.isDevServerRunning = process.env.WEBPACK_DEV_SERVER;

        this.nodeEnv = 'production';
        if (!process.env.NODE_ENV && this.isDevServerRunning) {
            this.nodeEnv = 'development';
        } else if (process.env.NODE_ENV) {
            this.nodeEnv = process.env.NODE_ENV;
        }

        process.env.NODE_ENV = this.nodeEnv;

        this.https = false;

        if (process.env.DEV_SERVER_SSL_KEY && process.env.DEV_SERVER_SSL_CERT) {
            this.https = {
                key: fs.readFileSync(process.env.DEV_SERVER_SSL_KEY),
                cert: fs.readFileSync(process.env.DEV_SERVER_SSL_CERT)
            };
        }

        const devHost = process.env.DEV_SERVER_HOST ? process.env.DEV_SERVER_HOST : 'localhost'
        const devPort = process.env.DEV_SERVER_PORT ? process.env.DEV_SERVER_PORT : '8085'

        this.devServer = {
            contentBase: process.env.DEV_SERVER_CONTENT_BASE ? process.env.DEV_SERVER_CONTENT_BASE : path.join(this.basePath, 'dist'),
            host: devHost,
            port: devPort,
            publicPath: process.env.DEV_SERVER_PUBLIC ? process.env.DEV_SERVER_PUBLIC : (this.https ? 'https' : 'http') + `://${devHost}:${devPort}/`
        };

        // Settings
        this.srcPath = this.basePath + '/src';
        this.distPath = this.basePath + '/dist';
        this.jsFilename = '[name].min.js';

        // Set options from class call
        this.type = options.type || 'asset';
        this.config = options.config || {};
        this.postCssConfig = options.postCssConfig || path.resolve(__dirname, 'postcss.config.js');
        this.removeFiles = options.removeFiles || null;

        if (this.types.indexOf(this.type) === -1) {
            throw 'Type "' + this.type + '" is not a valid config type.';
        }

        return merge(this[this.type](), this.config);
    }

    /**
     * Get dev server options
     * @private
     */
    _devServer() {
        return {
            contentBase: this.devServer.contentBase,
            watchContentBase: true,
            disableHostCheck: true,
            headers: {"Access-Control-Allow-Origin": "*"},
            host: this.devServer.host,
            hot: true,
            https: this.https,
            inline: true,
            port: this.devServer.port,
            public: this.devServer.publicPath,
            stats: 'errors-only'
        };
    }

    /**
     * Base webpack config
     */
    base() {
        const plugins = [];
        let optimization = {};

        // Only load dotenv plugin if there is a .env file
        if (this.envPath) {
            plugins.push(new Dotenv());
        }

        if (this.removeFiles && typeof this.removeFiles === 'object' && !this.isDevServerRunning) {
            let after = {
                root: this.removeFiles.root || this.distPath,
            };

            if (this.removeFiles.test !== undefined && this.removeFiles.test !== null && Array.isArray(this.removeFiles.test)) {
                let removeRegExpTests = [];
                this.removeFiles.test.forEach(regExp => {
                    removeRegExpTests.push({
                        folder: '.',
                        method: (absPath) => {
                            return new RegExp(regExp, 'm').test(absPath);
                        }
                    });
                });

                after.test = removeRegExpTests;
            }

            if (this.removeFiles.include !== undefined) {
                after.include = this.removeFiles.include;
            }

            plugins.push(new RemovePlugin({
                after: after
            }));
        }

        if (!this.isDevServerRunning) {
            plugins.push(new CleanWebpackPlugin());
            optimization = {
                splitChunks: {
                    maxInitialRequests: Infinity,
                    minSize: 0,
                    cacheGroups: {
                        'craft-components': {
                            test: module => {
                                return module.identifier().includes('src/js/components') && module.identifier().includes('.ts');
                            },
                            name: module => {
                                const list = module.identifier().split('/');
                                const filename = list.pop().split('.');
                                return filename.shift();
                            },
                            enforce: true,
                        }
                    }
                },
                minimize: true,
                minimizer: [
                    new TerserWebpackPlugin({
                        extractComments: false,
                        parallel: true,
                        sourceMap: true,
                        terserOptions: {
                            compress: {
                                keep_classnames: true,
                                keep_fnames: true,
                                unused: false,
                            },
                            mangle: false,
                            output: {
                                comments: false,
                            },
                        },
                        test: /\.js(\?.*)?$/i,
                    }),
                    this.nodeEnv === 'production' ? new CssMinimizerPlugin({
                        parallel: true,
                    }) : null,
                ],
            };
        }

        const baseConfig = {
            watch: this.nodeEnv === 'development',
            mode: this.nodeEnv,
            devtool: 'source-map',
            optimization,
            resolve: {
                alias: {
                    build_modules: path.resolve(__dirname, 'node_modules'),
                },
                extensions: ['.wasm', '.ts', '.tsx', '.mjs', '.js', '.json', '.vue'],
                modules: [path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, '../../node_modules'), 'node_modules']
            },
            resolveLoader: {
                modules: [path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, '../../node_modules'), 'node_modules'],
            },
            module: {
                rules: [
                    // Typescript
                    {
                        test: /.ts$/,
                        exclude: /(node_modules|bower_components)/,
                        use: {
                            loader: 'ts-loader',
                            options: {
                                configFile: path.resolve(__dirname, './tsconfig.json'),
                            }
                        }
                    },
                    // Babel
                    {
                        test: /.m?js?$/,
                        exclude: /(node_modules|bower_components)/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                plugins: [path.resolve(__dirname, './node_modules/@babel/plugin-syntax-dynamic-import')],
                                presets: [path.resolve(__dirname, './node_modules/@babel/preset-env'), path.resolve(__dirname, './node_modules/@babel/preset-typescript')]
                            }
                        }
                    },
                ]
            },
            plugins,
        };

        return baseConfig;
    }

    /**
     * Asset webpack config
     */
    asset() {
        const assetConfig = {
            context: this.srcPath,
            output: {
                filename: this.jsFilename,
                path: this.distPath,
                publicPath: this.nodeEnv == 'development' ? this.devServer.publicPath : '/',
            },
            devServer: this._devServer(),
            module: {
                rules: [
                    {
                        test: /\.s?[ac]ss$/i,
                        use: [
                            'vue-style-loader',
                            {
                                loader: MiniCssExtractPlugin.loader,
                                options: {
                                    hmr: (this.nodeEnv === 'development'),
                                    publicPath: '../',
                                }
                            },
                            'css-loader',
                            {
                                loader: 'postcss-loader',
                                options: {
                                    postcssOptions: {
                                        path: this.postCssConfig
                                    },
                                }
                            },
                            {
                                loader: "sass-loader",
                                options: {
                                    // Prefer `dart-sass`
                                    implementation: require("sass"),
                                },
                            },
                        ],
                    },
                    {
                        test: /fonts\/[a-zA-Z0-9\-\_]*\.(ttf|woff|svg)$/,
                        loader: 'file-loader',
                        options: {
                            name: 'fonts/[name].[ext]',
                            publicPath: '../',
                        }
                    },
                    {
                        test: /\.(jpg|gif|png|svg|ico)$/,
                        loader: 'file-loader',
                        exclude: [
                            path.resolve(this.srcPath, './fonts'),
                        ],
                        options: {
                            name: '[path][name].[ext]',
                            publicPath: '../',
                        }
                    },
                ],
            },
            plugins: [
                new MiniCssExtractPlugin({
                    filename: 'css/[name].css',
                    chunkFilename: 'css/[name].css',
                }),
            ]
        };

        return merge(this.base(), assetConfig);
    }

    lib() {
        // Remove placeholder entry file for lib assets
        if (!this.removeFiles) {
            this.removeFiles = {test: []};
        } else if (this.removeFiles && typeof this.removeFiles === 'object' && this.removeFiles.test === undefined) {
            this.removeFiles.test = [];
        }

        this.removeFiles.test.push(/entry/);

        return this.asset();
    }

    /**
     * Vue webpack config
     */
    vue() {
        const optimization = this.isDevServerRunning ? {} : {
            splitChunks: {
                name: false,
                cacheGroups: {
                    commons: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'chunk-vendors',
                        chunks: 'all'
                    }
                }
            }
        };

        const vueConfig = {
            context: this.srcPath,
            output: {
                filename: this.jsFilename,
                path: this.distPath,
                publicPath: this.devServer.publicPath,
            },
            module: {
                rules: [
                    {
                        test: /\.vue$/i,
                        use: [
                            'vue-loader',
                        ]
                    }
                ]
            },
            devServer: this._devServer(),
            optimization,
            externals: {
                'vue': 'Vue',
                'vue-router': 'VueRouter',
                'vuex': 'Vuex',
                'axios': 'axios'
            },
            plugins: [
                new VueLoaderPlugin(),
                new webpack.HotModuleReplacementPlugin(),
                new ManifestPlugin({
                    publicPath: '/'
                }),
            ],
        };

        return merge(this.asset(), vueConfig);
    }
}

module.exports = CraftWebpackConfig;