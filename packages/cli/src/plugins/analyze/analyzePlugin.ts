import fs from 'fs';
import open from 'better-opn';
import path from 'path';
import chalk from 'chalk';
import { BundleStatsWebpackPlugin } from 'bundle-stats-webpack-plugin';
import { WebpackPluginInstance } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { CommandBuilder } from 'yargs';

import { ConfigurationContext, ImaCliPluginFactory } from '../../types';
import logger from '../../lib/logger';

export interface AnalyzePluginConfigurationContext
  extends ConfigurationContext {
  analyze?: ConfigurationContext['name'];
  analyzeBaseline?: boolean;
}

export interface AnalyzePluginOptions {
  open: boolean;
  compare: boolean;
  bundleStatsOptions?: BundleStatsWebpackPlugin.Options;
  bundleAnalyzerOptions?: BundleAnalyzerPlugin.Options;
}

// TODO extract to separate npm package
/**
 * Enable analyze plugin using 'analyze' cli argument in build command.
 */
const analyzePluginBuildCliArgs: CommandBuilder = {
  analyze: {
    desc: 'Runs multiple webpack bundle analyzer plugins on given entry',
    type: 'string',
    choices: ['server', 'client', 'client.es']
  },
  analyzeBaseline: {
    desc: 'Generates baseline for webpack bundle stats comparison',
    type: 'boolean'
  }
};

/**
 * Appends webpack bundle analyzer plugin to the build command config.
 *
 * @param {AnalyzePluginOptions} options.
 * @returns {ImaCliPlugin} Cli plugin definition.
 */
const AnalyzePlugin: ImaCliPluginFactory<AnalyzePluginOptions> = options => ({
  name: 'analyze-plugin',
  cliArgs: {
    build: analyzePluginBuildCliArgs
  },
  webpack: async (config, ctx: AnalyzePluginConfigurationContext) => {
    const { analyze, isServer, isEsVersion } = ctx;

    if (!analyze) {
      return config;
    }

    const isCompare = options?.compare === true;
    const isBaseline =
      ctx?.analyzeBaseline === true ||
      (isCompare &&
        !fs.existsSync(path.join(ctx.rootDir, 'build/bundle-stats.html')));

    if (
      (analyze === 'server' && isServer) ||
      (analyze === 'client.es' && isEsVersion) ||
      (analyze === 'client' && !isEsVersion && !isServer)
    ) {
      config.plugins?.push(
        new BundleStatsWebpackPlugin({
          // @ts-expect-error Not in type definitions
          silent: true,
          compare: isCompare,
          baseline: isBaseline,
          ...(options?.bundleStatsOptions ?? {})
        }) as WebpackPluginInstance,
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          generateStatsFile: true,
          logLevel: 'silent',
          openAnalyzer: false,
          ...(options?.bundleAnalyzerOptions ?? {})
        })
      );
    }

    return config;
  },
  onDone: ({ firstRun, args }) => {
    // @ts-expect-error to be fixed (args contain analyze but its not properly typed)
    if (firstRun === false || !args.analyze) {
      return;
    }

    const reportPath = path.join(args.rootDir, 'build/report.html');
    const statsPath = path.join(args.rootDir, 'build/stats.json');
    const bundleStatsPath = path.join(args.rootDir, 'build/bundle-stats.html');

    const reportExists = fs.existsSync(reportPath);
    const statsExists = fs.existsSync(statsPath);
    const bundleStatsExists = fs.existsSync(bundleStatsPath);

    // Don't print anything if no report was generated
    if (!reportExists && !statsExists && !bundleStatsExists) {
      return;
    }

    logger.plugin(
      `${chalk.bold.bgBlue.black('Analyze plugin')} generated following report:`
    );

    if (reportExists || statsExists) {
      logger.write(chalk.bold.underline('\nWebpack Bundle Analyzer:'));
      reportExists && logger.write(`${chalk.gray('├')} report - ${reportPath}`);
      statsExists &&
        logger.write(`${chalk.gray('└')} webpack stats - ${statsPath}`);
    }

    if (bundleStatsExists) {
      logger.write(chalk.bold.underline('\nWebpack Bundle Stats:'));
      logger.write(`${chalk.gray('└')} report - ${bundleStatsPath}`);
    }

    // Write info about stats.json usage
    if (statsExists) {
      logger.write(
        chalk.bold(
          `\nThe generated ${chalk.green(
            'stats.js'
          )} file can be used in the following online analyzers:`
        )
      );
      logger.write(
        `${chalk.gray(
          '├'
        )} https://alexkuz.github.io/webpack-chart/ ${chalk.gray(
          '- interactive pie chart'
        )}`
      );
      logger.write(
        `${chalk.gray(
          '├'
        )} https://chrisbateman.github.io/webpack-visualizer/ ${chalk.gray(
          '- visualize and analyze bundle'
        )}`
      );
      logger.write(
        `${chalk.gray('└')} https://webpack.jakoblind.no/optimize/ ${chalk.gray(
          '- analyze and optimize bundle'
        )}`
      );
    }

    if (options?.open !== false) {
      reportExists && open(`file://${reportPath}`);
      bundleStatsExists && open(`file://${bundleStatsPath}`);
    }
  }
});

export default AnalyzePlugin;