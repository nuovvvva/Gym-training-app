import { EXERCISES, WORKOUTS } from "./swoldier";
const exercises = exerciseFlatter(EXERCISES)

export function generateWorkout(args) {
  const { muscles, poison: workout, goal } = args;
  let exer = Object.keys(exercises);
  exer = exer.filter((key) => exercises[key].meta.environment !== 'home');
  let includedTracker = [];
  let numSets = 5;
  let listOfMuscles;

  if (workout === 'individual') {
    listOfMuscles = muscles;
  } else {
    listOfMuscles = WORKOUTS[workout][muscles[0]];
  }

  listOfMuscles = new Set(shuffleArray(listOfMuscles));

}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }//Math.random()静态方法返回一个0-1之间的随机浮点数

  return array;
}

function exerciseFlatter(exercisesObj) {
  const flattenedObj = {};

  for (const [key, val] of Object.entries(exercisesObj)) {
    if (!('variants' in val)) {
      flattenedObj[key] = val;
    } else {
      for (const variant in val.variants) {
        let variantName = variant + '_' + key;
        let variantSubstitutes = Object
          .keys(val.variants)
          .map((element) => {
            return element + ' ' + key
          })
          .filter(element => element
            .replaceAll(' ', '_') !== variantName
          )
          ;//把剩下的variant放进variantSubstitutes里，因为是剩下全部，所以要用迭代。迭代从val.variants开始，通过.keys方法生成一个键名数组，再用map迭代数组元素

        flattenedObj[variantName] = {
          ...val,
          description: val.description + '___' + val.variants[variant],
          substitutes: [
            ...val.substitutes,
            variantSubstitutes
          ].slice(0, 5)
        }
      }
    }
  }

  return flattenedObj;
}
