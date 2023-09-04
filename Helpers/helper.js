const express = require("express");
const User = require('../model/userModel')

const generateRef = async(user_id) =>{
    try {
        const user = await User.findOne({_id : user_id})
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [array[i], array[j]] = [array[j], array[i]];
            }
          }
          
          function mixNameWithNumbers(name) {
            const nameArray = name.split('');
            shuffleArray(nameArray);
            
            const mixedArray = [];
            for (const char of nameArray) {
              if (Math.random() < 0.5) {  // 50% chance of adding a random number
                mixedArray.push(Math.floor(Math.random() * 10));  // Add a random number between 0 and 9
              }
              mixedArray.push(char);
            }
            
            return mixedArray.join('');
          }
          
          const yourName = user.name;
          const mixedName = mixNameWithNumbers(yourName);
          return mixedName          
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
  generateRef
};
