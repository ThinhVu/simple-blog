export function generateRandomCode(length: number) {
   let output = '';
   for (let i = 0; i<length; ++i) {
      const useNumber = randomBoolean()
      if (useNumber) {
         output += String.fromCharCode(randomNumberInRange(48, 57))
      } else {
         output += String.fromCharCode(randomNumberInRange(65, 90))
      }
   }
   return output;
}

function randomBoolean() {
   return Math.floor(Math.random() * 5) % 2 == 0
}

function randomNumberInRange(lower: number, upper: number) {
   return lower + Math.floor(Math.random() * (upper-lower))
}
