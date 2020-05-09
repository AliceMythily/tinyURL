import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  Linking,
  Text,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {WebView} from 'react-native-webview';

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      URL: '',
      validURL: false,
      generatedURL: '',
      storageKeyId: '',
    };
  }

  async componentDidMount() {
    // On screen load check storage key in AsyncStorage this item is used to store user URL
    try {
      const getId = await this.checkStorageKey();
      if (!getId) {
        this.setStorageKey();
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  //Check if @storageKeyId exist
  checkStorageKey = async () => {
    try {
      const retrievedItem = await AsyncStorage.getItem('@storageKeyId');
      const item = JSON.parse(retrievedItem);
      //if @storageKeyId exist get the value and set state to be used in generateURL function
      this.setState({storageKeyId: item});
      return item;
    } catch (error) {
      console.log(error.message);
    }
  };

  // Set @storageKeyId if do not exist
  setStorageKey = async (value) => {
    //If @storageKeyId is not stored in AsynStorage store 1 as value for @storageKeyId
    try {
      const setStorageKey = await AsyncStorage.setItem(
        '@storageKeyId',
        JSON.stringify(1),
      );
      if (setStorageKey) {
        this.setState({storageKeyId: 1});
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  //there is no library tht support url validation for react native below function do manual basic validation
  validateURL = () => {
    // this pattern i copy from online
    var pattern =
      '^(https?:\\/\\/)?' + // protocol
      '((([a-zA-Z\\d]([a-zA-Z\\d-]{0,61}[a-zA-Z\\d])*\\.)+' + // sub-domain + domain name
      '[a-zA-Z]{2,13})' + // extension
      '|((\\d{1,3}\\.){3}\\d{1,3})' + // OR ip (v4) address
      '|localhost)' + // OR localhost
      '(\\:\\d{1,5})?' + // port
      '(\\/[a-zA-Z\\&\\d%_.~+-:@]*)*' + // path
      '(\\?[a-zA-Z\\&\\d%_.,~+-:@=;&]*)?' + // query string
      '(\\#[-a-zA-Z&\\d_]*)?$'; // fragment locator

    var regex = new RegExp(pattern);
    // Only do checking if url is still not valid
    if (!this.state.validURL && regex.test(this.state.URL)) {
      // This will setState and enable the submit button
      this.setState({validURL: true});
    }
    // If user backspace and the textinput is empty will setState and disable the button
    else if (this.state.validURL && this.state.URL == '') {
      this.setState({validURL: false});
    }
  };

  // There is not library for url convertor for react native this function will manually convert the URL
  // React native will not support node.js lib
  generateURL = () => {
    let URL = this.state.URL;
    let fetchValue = 'https://tinyurl.com/api-create.php?url=' + URL;
    fetch(fetchValue, {
      method: 'GET',
    }) //Convert response to text
      .then((response) => response.text()) // Convert response to string
      .then((responseJson) => {
        // Set the converted url in generatedURL
        this.setState({generatedURL: responseJson});
        //Call function to store the url to AsyncStorage
        this.storeData();
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  //Function to store generated URL in AsyncStorage to display in history tab
  storeData = async (value) => {
    try {
      const id = this.state.storageKeyId + 1; //plus 1 to increase value to be not same as previous item
      const urlStoreKey = '@URL' + id;
      //original url inputed by user
      const oriURL = this.state.URL;
      //url generated from tunyurl
      const genURL = this.state.generatedURL;
      //stringyfy item to be stored
      const value1 = JSON.stringify({urlStoreKey, oriURL, genURL});
      //URL
      const data1 = [urlStoreKey, value1];
      //each url will have unique storagekey
      const data2 = ['@storageKeyId', JSON.stringify(this.state.storageKeyId)];
      await AsyncStorage.multiSet([data1, data2], () =>
        this.setState({storageKeyId: this.state.storageKeyId + 1}),
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  render() {
    return (
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.headerText}>URL Shortener </Text>
        </View>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Generate TinyURL</Text>
              <Text style={styles.sectionDescription}>
                Key in <Text style={styles.highlight}>Valid </Text>
                URL in the textbox below. Select Generate TinyURL Button.
              </Text>
            </View>
            <TextInput
              placeholder="Enter URL e.g: https://www.google.com"
              style={styles.textinput}
              onChangeText={(text) => this.setState({URL: text})}
              onEndEditing={this.validateURL()}
              autoCapitalize={'none'}
            />
            <TouchableOpacity
              onPress={this.generateURL}
              //different styling applied to button based on state
              style={
                this.state.validURL
                  ? styles.submitEnabled
                  : styles.submitDisabled
              }
              //if criteria not met button will remain disabled
              disabled={!this.state.validURL}>
              <Text
                style={
                  this.state.validURL
                    ? styles.buttonEnabledText
                    : styles.buttonDisabledText
                }>
                Generate TinyURL
              </Text>
            </TouchableOpacity>
            {this.state.generatedURL ? (
              //only load this if URL is generated
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Your Results</Text>
                <Text style={styles.highlight}>Original URL</Text>
                <Text
                  style={styles.url}
                  onPress={() => Linking.openURL(this.state.URL)}>
                  {this.state.URL}
                </Text>
                <Text style={styles.highlight}>Generated URL</Text>
                <Text
                  style={styles.url}
                  onPress={() => Linking.openURL(this.state.generatedURL)}>
                  {this.state.generatedURL}
                </Text>
                <View style={styles.iFrame}>
                  <WebView
                    originWhitelist={['*']}
                    scalesPageToFit
                    source={{uri: this.state.generatedURL}}
                  />
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  textinput: {
    fontSize: 18,
    marginTop: 30,
    marginBottom: 10,
    height: 45,
    paddingLeft: 5,
    borderWidth: 0.5,
    borderRadius: 4,
    borderColor: 'grey',
    alignSelf: 'center',
    width: deviceWidth - 60,
    backgroundColor: 'white',
  },
  buttonEnabledText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  buttonDisabledText: {
    fontSize: 18,
    color: 'gray',
  },
  submitEnabled: {
    backgroundColor: '#027373',
    height: 45,
    width: deviceWidth - 60,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 30,
    borderColor: '#027373',
    borderWidth: 1,
  },
  submitDisabled: {
    backgroundColor: 'lightgray',
    height: 45,
    width: deviceWidth - 60,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 30,
  },
  iFrame: {
    width: '100%',
    height: 300,
    marginBottom: 20,
  },
  url: {
    color: 'blue',
    textDecorationLine: 'underline',
    marginTop: 5,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  header: {
    backgroundColor: '#658C0F',
    height: 60,
  },
  headerText: {
    fontSize: 28,
    color: 'white',
    textAlign: 'center',
    marginVertical: 15,
  },
  scrollView: {
    backgroundColor: '#fcfaf7',
    height: deviceHeight,
  },
  body: {
    backgroundColor: '#fcfaf7',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: '#444',
  },
  highlight: {
    fontWeight: '700',
  },
});
