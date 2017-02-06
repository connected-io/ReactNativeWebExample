import React, {Component} from 'react';
import { connect } from 'react-redux';
import {
  StyleSheet,
  Text,
  View,
  DeviceEventEmitter
} from 'react-native';
import {Gyroscope} from 'NativeModules'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

class MainComponent extends Component {
	constructor(props) {
		super(props);

		this.state = {
			rotationRateX: -1,
            rotationRateY: -2
		}
	}

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

	static mapReduxStateToProps = (reduxState) => {
		return {
			reduxState: reduxState
		}
	};
}
module.exports = connect(MainComponent.mapReduxStateToProps, null, null, {withRef: true})(MainComponent);
