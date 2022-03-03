import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom";
import {
    View,
    StyleSheet,
    Text,
    TextInput,
    Alert,
    SafeAreaView, 
    ScrollView,
    Button,
    Keyboard,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import CustomButton from '../../components/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header';
import GlobalStyle from '../../styles/GlobalStyle';
import DropdownStyle from '../../styles/DropdownStyle';
import user_struct from '../../global_structures.js';
// import {glucose_diary_entry} from '../../global_structures.js'; // for some reason this is just giving undefined for the useState
import GlucoseInputComponent from '../../components/GlucoseInputComponent';
import InjectionInputComponent from "../../components/InjectionInputComponent";
import DateTimePicker from '@react-native-community/datetimepicker';
import CheckBox from "expo-checkbox"
import temp from '../temp';
import DialogInput from 'react-native-dialog-input';

const glucose_diary_entry = {
    date: "",
    glucose_readings: [],
    injections: [],
    feel_sick: "",
}

export default function GlucoseDiary({ navigation, route }) {
    const [diary_entry, setDiaryEntry] = useState(glucose_diary_entry)

    const [n_glucose_inputs, setNGlucoseInputs] = useState(0);
    const [glucose_input_components_data, setGlucoseComponentsData] = useState([]);

    const [n_injections, setNInjections] = useState(0);
    const [injections_data, setInjectionsData] = useState([]);

    const [date, setDate] = useState(new Date())
    const [showDatePicker, setShowDatePicker] = useState(false)

    const [feelSick, setFeelSick] = useState(false);
    const [hypo, setHypo] = useState(false);
    const [hypoReason, setHypoReason] = useState("");
    const [showHypoDialog, setShowHypoDialog] = useState(false);

    useEffect(() => {
        getOrCreateGlucoseDiary();
    }, []); // don't know what this is doing

    useEffect(() => {
        setGlucoseComponentsData(state => ([...state, {index:n_glucose_inputs, time: new Date(), reading: ""}]) )
    }, [n_glucose_inputs]);

    useEffect(() => {
        setInjectionsData(state => ([...state, {index:n_injections, time: new Date(), type: "", units: ""}]) )
    }, [n_injections]);

    const getOrCreateGlucoseDiary = async () => {
        try {
            const glucose_diary = await AsyncStorage.getItem('GlucoseDiary');
            if (glucose_diary == null) {
                console.log("glucose diary does not exist yet, creating...");
                AsyncStorage.setItem("GlucoseDiary", JSON.stringify([]));
            }
            else {
                console.log("glucose diary: ", glucose_diary);
            }
        } catch (error) {
            console.log("glucose diary getItem error");
            console.log(error);
        }
    }

    const appendToDiary = async () => {
        // console.log(diary_entry)
        if (Object.values(diary_entry).some(x => x !== '')) {
            try {
                const diary = JSON.parse(await AsyncStorage.getItem('GlucoseDiary'))

                let final_entry = {
                    date: date,
                    glucose_readings: glucose_input_components_data,
                    injections: injections_data,
                    feel_sick: feelSick,
                    hypo: hypo,
                    hypo_reason: hypoReason,
                }

                console.log(final_entry)
                diary.push(final_entry);
                
                await AsyncStorage.setItem("GlucoseDiary", JSON.stringify(diary))
                navigation.navigate("Home");
            } catch (error) {
                console.log(error);
            }
        } else {
            Alert.alert("Diary entry cannot be empty, please put data")
            console.log("empty field in form")
        }
    }

    const checkForHypo = () => {
        for (let i = 0; i < glucose_input_components_data.length; i++) {
            console.log("checking for hypo");
            let value = glucose_input_components_data[i]["reading"];
            try {
                if (parseInt(value) < 4) {
                    console.log("hypo found");
                    setHypo(true);
                    return true
                }
            } catch (error) {
                console.log("error in function checkForHypo in GlucoseDiary: ", error);
            }
        }
        return false
    }

    function addGlucoseInputComponent() {
        // console.log(glucose_input_components_data)
        setNGlucoseInputs(n_glucose_inputs + 1);
    }

    function addInjectionInputComponent() {
        // console.log(injections_data)
        setNInjections(n_injections + 1);
    }

    return (
        <SafeAreaView>
            <ScrollView keyboardShouldPersistTaps="never" onScrollBeginDrag={Keyboard.dismiss}>
                <View style={styles.body}>
                    <Header/>

                    <Text style={[GlobalStyle.CustomFont, styles.text]}>
                        Glucose Diary
                    </Text>

                    {showDatePicker && (
                        <DateTimePicker
                            testID="datePicker"
                            value={date}
                            display="default"
                            onChange={(event, date) => {
                                setShowDatePicker(false);
                                if (date != undefined) {
                                    setDate(date)
                                    setDiaryEntry(state => ({ ...state, ["date"]:date.toLocaleDateString('en-GB') }), [])
                                }
                            }}
                        />
                    )}

                    <CustomButton
                        onPressFunction={() => setShowDatePicker(true)}
                        title="Enter Date"
                        color="#008c8c"
                    />

                    <Text style={[GlobalStyle.CustomFont, styles.text]}>
                        Readings
                    </Text>
                    {glucose_input_components_data.map((input_component) => <GlucoseInputComponent key={input_component.index} id={input_component.index} setGlucoseComponentsData={setGlucoseComponentsData} glucoseReadings={glucose_input_components_data}/>)}
                    <CustomButton 
                        onPressFunction={() => addGlucoseInputComponent()}
                        title="Enter another reading"
                        color="#008c8c"
                    />

                    <Text style={[GlobalStyle.CustomFont, styles.text]}>
                        Injections
                    </Text>
                    {injections_data.map((input_component) => <InjectionInputComponent key={input_component.index} id={input_component.index} setInjectionsData={setInjectionsData} injectionsData={injections_data}/>)}
                    <CustomButton 
                        onPressFunction={() => addInjectionInputComponent()}
                        title="Enter another insulin value"
                        color="#008c8c"
                    />

                    <View style={styles.checkboxContainer}>
                        <Text style={styles.label}>I don't feel well</Text>
                        <CheckBox
                            value={feelSick}
                            onValueChange={setFeelSick}
                            style={GlobalStyle.CheckBox}
                        />
                    </View>

                    <DialogInput isDialogVisible={showHypoDialog}
                        title={"Low Blood Sugar"}
                        message={"One of your blood glucose readings was <4mmol/L, please explain why"}
                        hintInput ={"Reason"}
                        submitInput={ value => {
                            setHypoReason(value);
                            setShowHypoDialog(false);
                        }}
                        closeDialog={ () => setShowHypoDialog(false) }>
                    </DialogInput>

                    <CustomButton
                        style={{marginTop: 40}}
                        title='add to diary'
                        color='#1eb900'
                        onPressFunction={() => {
                            if (checkForHypo() & hypoReason == "") {
                                setShowHypoDialog(true);
                            } else {
                                appendToDiary();
                            }
                        }}
                    />

                    <View style={{display: 'flex', flexDirection: 'column', paddingBottom: 100}}>
                        <CustomButton
                            title='Go to Homepage directly'
                            color='#761076'
                            onPressFunction={() => navigation.navigate("Home")}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    body: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#e9c5b4',
    },
    text: {
        fontSize: 30,
        marginBottom: 130,
        textAlign: "center",
    },
    checkboxContainer: {
        flexDirection: "row",
        marginBottom: 20,
      },
    checkbox: {
    alignSelf: "center",
    },
    label: {
    margin: 8,
    },
})