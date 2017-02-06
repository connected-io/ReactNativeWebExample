# React Native for Web

Utilizes [react-native-web](https://github.com/necolas/react-native-web) to render react-native UI components in a web 
browser.  It's a web implementation (so using divs) of react-native base components (View, Text, etc.).  However, sometimes
we will need to implement a particular module or component ourselves, because it is not implemented in `react-native-web`
or to better suit our purposes.

## Usage

```bash
# From project root directory
npm install

npm run web                 # open browser and go to localhost:3000
react-native run-android    # runs on android device
react-native run-ios        # runs on ios simulator
``` 

## Example Overview

Uses [webpack](https://github.com/webpack/webpack) and [webpack-dev-server](https://github.com/webpack/webpack-dev-server), and and so has all the features therein.  Of particular note:   

```javascript
// webpack.config.dev.js
 
module.exports = {
    // ...
    resolve: {
        alias: {
            'react-native': path.join(__dirname, '/native-libraries/MockReactNative.js'),
            'NativeModules': path.join(__dirname, '/native-libraries/MockNativeModules.js')
        }
    }
};

```

Since the app is running in a web browser, there is no notion of native components.  The webpack points native-related
modules to faked ones.  In this example, we are mocking the `Gyroscope` with the following:

```javascript
// MockNativeModules.js
 
// Stubs out the Gyroscope native module functions
class Gyroscope {
    static setGyroUpdateInterval() {
        console.log('setGyroUpdateInterval');
    }

    static startGyroUpdates() {
        console.log('startGyroUpdates');
    }

    static stopGyroUpdates() {
        console.log('stopGyroUpdates');
    }
}

module.exports = {Gyroscope}
```

Normally, you subscribe to a `DeviceEventEmitter` to receive events from the gyroscope.  (Actually this has since been 
deprecated, but the idea remains the same.) For web, we need to mock these events.  Here we use timer that periodically 
emits an incrementing value:

```javascript
// MockReactNative.js
 
// Replaces DeviceEventEmitter with a timer periodically emitting an incrementing x and y value.
class DeviceEventEmitter {
    static addListener(id, callback) {
        setInterval(() => {
            if (!this.t) {
                this.t = 0;
            }
            this.t += 0.001;

            let rotationRate = {
                x: this.t,
                y: this.t
            };

            callback({
                rotationRate: rotationRate
            });
        }, 100);
    }
}

module.exports = {
    DeviceEventEmitter,
    ...require('react-native-web')  // Plus everything implemented in react-native-web
};
```

And thus, we can use the Gyroscope like we would in a regular non-web react-native app:
```javascript
// MainComponent.js
 
import {
    StyleSheet,
    Text,
    View,
    DeviceEventEmitter
} from 'react-native';
import {Gyroscope} from 'NativeModules'
// ...
class MainComponent extends Component {
    // ...
    componentDidMount() {
        Gyroscope.setGyroUpdateInterval(100 / 1000); // in seconds
        Gyroscope.startGyroUpdates();
    
        this._gyroDataSubscription = DeviceEventEmitter.addListener('GyroData', (data) => {
            this.setState({
                rotationRateX: data.rotationRate.x,
                rotationRateY: data.rotationRate.y
            })
        });
    }
    
    componentWillUnmount() {
        Gyroscope.stopGyroUpdates();
    }
    
    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    Welcome to React Native!
                </Text>
                <Text style={styles.instructions}>
                    To get started, edit index.android.js
                </Text>
                <Text style={styles.instructions}>
                    x: {Math.round(this.state.rotationRateX * 1000, 3) / 1000}, y: {Math.round(this.state.rotationRateY * 1000, 3) / 1000}
                </Text>
            </View>
        );
    }
    // ...
}
```

## Recommendations

`react-native-web` implements foundational components of react-native in web, and is still actively updated. However, 
custom native modules would have to be mocked or faked for the web.  In addition, many components (such as 
[NavigationExperimental](https://facebook.github.io/react-native/docs/navigation.html)) still aren't implemented, and 
doing so would take a significant amount of development effort. There is also the question of whether mobile UI/UX 
designs would make for a good experience on web.

In summary, it is not feasible, from both an implementation standpoint and a user experience standpoint, to simply
drop react-native into a web environment and expect it to work (well).

The most practical approach is to implement specific components (i.e. a particular listview) in  a way that they can
be used for both web and mobile react-native applications, but still branch off in terms of navigation and the placement
of specific UI elements



