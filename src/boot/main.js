/*global document: true */
import {checkVersion} from './version';
import Module from './Module';

global.window = global.self = global;
global.tabris = {};

tabris._start = function(client) {
  try {
    tabris._client = client;
    let rootModule = new Module();
    try {
      rootModule.require('tabris');
      tabris._client = client; // required by head.append
      checkVersion(tabris.version, client.get('tabris.App', 'tabrisJsVersion'));
    } catch (error) {
      console.error('Could not load tabris module: ' + error);
      console.log(error.stack);
      return;
    }
    tabris._defineModule = function(id, fn) {
      return new Module(id, rootModule, fn);
    };
    let cordovaScript = document.createElement('script');
    cordovaScript.src = './cordova.js';
    document.head.appendChild(cordovaScript);
    if (tabris._init) {
      tabris._init(client);
    }
    let loadMain = function() {
      try {
        rootModule.require('./');
        tabris.trigger('flush');
      } catch (error) {
        console.error('Could not load main module: ' + error);
        console.log(error.stack);
      }
    };
    if (tabris._entryPoint) {
      tabris._entryPoint(loadMain);
      delete tabris._entryPoint;
    } else {
      loadMain();
    }
    tabris.trigger('flush');
  } catch (ex) {
    console.error(ex);
    console.log(ex.stack);
  }
};

tabris._notify = function() {
  // client may get the reference to _notify before tabris has been loaded
  return tabris._notify.apply(this, arguments);
};
