import { Linking, Text, View, StyleSheet, Image, TextInput, TouchableOpacity } from "react-native";
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { RFValue } from "react-native-responsive-fontsize";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.upperWrapper}>
            <Image style={styles.logo} resizeMode='contain' source={require('../assets/images/logo.png')}/>
            <Text style={styles.title}>QuickLoad</Text>
        </View>
        <View style={{flexDirection: "row", justifyContent: 'center', alignItems:'center'}}>
            <TouchableOpacity style={{alignSelf: "flex-start"}} onPress={()=>router.back()}>
                <Image resizeMode="contain" style={{width: responsiveWidth(8), height: responsiveHeight(8)}} source={require('../assets/images/backButton.png')}/>
            </TouchableOpacity>
            <Text style={{paddingHorizontal:responsiveWidth(15), fontWeight: 'bold', color:"white", fontSize:RFValue(25)}}>How to Register:</Text>
        </View>
        <View style={styles.card}>
            <Text style={{color:"white", fontWeight : 'bold', fontSize: RFValue(12), fontStyle:'italic', marginBottom: responsiveHeight(2)}}>1. Click the button below to register on Telegram</Text>
            <Text style={{color:"white", fontWeight : 'bold', fontSize: RFValue(12), fontStyle:'italic', marginBottom: responsiveHeight(2)}}>2. Enter /start to view the instructions</Text>
            <Text style={{color:"white", fontWeight : 'bold', fontSize: RFValue(12), fontStyle:'italic', marginBottom: responsiveHeight(2)}}>3. Enter /register *password* to register yourself</Text>
            <Text style={{color:"white", fontWeight : 'bold', fontSize: RFValue(12), fontStyle:'italic', marginBottom: responsiveHeight(2)}}>4. Alternatively, enter /changepassword *newpassword* if you wish to change your password</Text>
            <Text style={{color:"white", fontWeight : 'bold', fontSize: RFValue(12), fontStyle:'italic', marginBottom: responsiveHeight(2)}}>5. Once you have successfully registered, you can login using the app!</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={() => Linking.openURL('https://t.me/quickloadreminder_bot')}>
            <Text style={{fontSize:RFValue(15), color: "white"}}>Register</Text>
        </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container : {
    flex : 1,
    backgroundColor: '#003D7C',
  },
  upperWrapper : {
    paddingVertical: responsiveHeight(5),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: "center",
    backgroundColor: '#EF7C00'
  },
  title : {
    fontFamily : "Epilogue-ExtraBold",
    fontWeight: "bold",
    color: "white",
    marginVertical: responsiveWidth(5),
    fontSize : RFValue(40)
  },
  logo : {
    width: responsiveWidth(20),
    height: responsiveHeight(20),
  },
  card : {
    backgroundColor: "#EF7C00",
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginHorizontal: responsiveWidth(5),
    borderRadius: 10,
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(3)
  },
  button : {
    marginTop: responsiveHeight(5),
    backgroundColor: "#EF7C00",
    alignSelf:'center',
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(2),
    borderRadius: 10
  }
})