import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Text,
    TextInput,
    Alert,
    SafeAreaView, 
    ScrollView,
} from 'react-native';
import GlobalStyle from '../styles/GlobalStyle';
import BarcodeScannerComponent from '../components/BarcodeScannerComponent';
import CustomButton from '../components/CustomButton';
import {object_is_empty} from '../global_structures.js'
// this is the food input which gets added to the page when user clicks the + button

const query_object_for_food_component = (object, key) => {
    if (object_is_empty(object)) return null
    if (object[key] == undefined) return null
    return object[key].toString()
}

//define all inputs in here!
const render_input_components = [
    {placeholder: "Food Name", is_numeric: false, component_update_key: "name", is_nutrient: false},
    {placeholder: "Amount (g)", is_numeric: true, component_update_key: "amount", is_nutrient: false},
    {placeholder: "Protein (100g)", is_numeric: true, component_update_key: "proteins", is_nutrient: true},
    {placeholder: "Sugar (100g)", is_numeric: true, component_update_key: "sugar", is_nutrient: true},
    {placeholder: "Fat (100g)", is_numeric: true, component_update_key: "fat", is_nutrient: true},
    {placeholder: "Carbohydrates (100g)", is_numeric: true, component_update_key: "carbohydrates", is_nutrient: true},
    {placeholder: "Fibre (100g)", is_numeric: true, component_update_key: "fiber", is_nutrient: true},
    {placeholder: "Sodium (100g)", is_numeric: true, component_update_key: "sodium", is_nutrient: true},
]

const FoodInputComponent = (props) => {
    const {food_input_components_data, setFoodInputComponentsData, id, setBarcodeScannerOpen, barcode_scanner_open} = props
        
    return (
        <View>
            {(object_is_empty(food_input_components_data[id]["scanned_item_object"])) ? 
                <Text>Diary data for food item {id+1}. </Text> : 
                <Text>Some data for food item {id+1} has been filled by Barcode scanner! Please double check and make sure to update anything that is not correct!</Text>
            }
            {/* Render all inputs here! All logic is dealt with, please define components above if neccesary*/}
            {render_input_components.map((val, index) => 
                <TextInput
                    key={index}
                    style={GlobalStyle.InputField}
                    placeholder={val.placeholder}
                    value={(val.is_nutrient) ? query_object_for_food_component(food_input_components_data[id]["scanned_item_object"]["nutrients"], val.component_update_key) : query_object_for_food_component(food_input_components_data[id]["scanned_item_object"], val.component_update_key)}
                    onChangeText={(value) => {
                        setFoodInputComponentsData(state => (state.map(val => { //updates the food_input_components_data
                            if (val.index == id) {
                                return {...val, [component_update_key]: value}
                            } return val;
                        })))
                    }}
                    keyboardType={(val.is_numeric) ? "numeric" : "default"}
                    // multiline={true}
                    // numberOfLines={1}
                />
            )}
            
            {(barcode_scanner_open[0] && barcode_scanner_open[1] == id) && <BarcodeScannerComponent id={id} setFoodInputComponentsData={setFoodInputComponentsData} setBarcodeScannerOpen={setBarcodeScannerOpen} barcode_scanner_open={barcode_scanner_open}/>}

            <CustomButton
                onPressFunction={() => {
                    setBarcodeScannerOpen([true, id])
                }}
                title={`Scan a food into food slot ${id+1}!`}
                color="#008c8c"
            />
        </View>
        )
}

export default FoodInputComponent