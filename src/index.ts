import { ResolveRequest, ResolveContext } from 'enhanced-resolve';
import {
  ResolvePluginInstance,
  Resolver,
  Tapable,
  TapAsyncCallback,
  TapAsyncInnerCallback,
  CreateInnerContext,
} from './types';

export class NXTResolverPlugin implements ResolvePluginInstance {
  source: string = 'described-resolve';
  target: string = 'resolve';

  log = console;

  constructor(
    rawOptions: Partial<{
      levels: string[];
    }> = {}
  ) {}

  apply(resolver: Resolver): void {
    if (!resolver) {
      this.log.warn('Found no resolver, not applying NXT-resolver');
      return;
    }

    if (!('fileSystem' in resolver)) {
      this.log.warn(
        " Please make sure you've placed the plugin in the correct part of the configuration." +
          ' This plugin is a resolver plugin and should be placed in the resolve part of the Webpack configuration.'
      );
      return;
    }

    resolver
      .getHook(this.source)
      .tapAsync({ name: 'NXT-Resolver' }, createPluginCallback(resolver, resolver.getHook(this.target)));
  }
}

function createPluginCallback(resolver: Resolver, hook: Tapable): TapAsyncCallback {
  return (request: ResolveRequest, resolveContext: ResolveContext, callback: TapAsyncInnerCallback) => {
    if (!request?.request?.startsWith('@')) {
      return callback();
    }
    const foundMatch = '';
    const createInnerContext: CreateInnerContext = require('enhanced-resolve/lib/createInnerContext');
    const newRequest = {
      ...request,
      request: foundMatch,
    };
    resolver.doResolve(
      hook,
      newRequest as never,
      `Resolved request '${request.request}' to '${foundMatch}' using nxt-resolver`,
      createInnerContext({ ...(resolveContext as any) }),
      (err2: Error, result2: ResolveRequest): void => {
        if (err2) {
          return callback(err2);
        }

        if (result2 === undefined) {
          return callback(undefined, undefined);
        }

        callback(undefined, result2);
      }
    );
  };
}
