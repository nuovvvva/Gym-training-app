import { EXERCISES, SCHEMES, TEMPOS, WORKOUTS } from "./swoldier";
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

  listOfMuscles = new Set(shuffleArray(listOfMuscles));//Set用于去重，生成一个不可索引的对象
  let arrOfMuscles = Array.from(listOfMuscles);//Array.from()方法重新生成数组，便于索引;第二段reduce用到的arrOfMuscles其实就是选择的WORKOUT里对应的workout的第一组带引号的肌肉
  let scheme = goal;
  let sets = SCHEMES[scheme].ratio
    .reduce((acc, curr, index) => {
      return [
        ...acc,
        ...[...Array(parseInt(curr)).keys()].map(
          (val) => index === 0 ? 'compound' : 'accessory'
        ),//.keys()方法生成一个整数索引的数组；Array(arrayLength)可以不使用new，两者都会创建一个新的Array实例
      ];
    }, [])
    .reduce((acc, curr, index) => {
      const muscleGroupToUse =
        index < arrOfMuscles.length
          ? arrOfMuscles[index]
          : arrOfMuscles[index % arrOfMuscles.length]
        ;

      return [
        ...acc,
        {
          setType: curr,
          muscleGroup: muscleGroupToUse,
        },
      ];
    }, [])
    ;

  const { compound: compoundExercises, accessory: accessoryExercises } = exer
    .reduce(
      (acc, curr) => {
        let exerciseHasRequiredMuscle = false;
        for (const musc of exercises[curr].muscles) {
          if (listOfMuscles.has(musc)) {
            exerciseHasRequiredMuscle = true;
          }
        }//muscles从val中来，是元数据EXERCISE中带有；for...in遍历属性名，for...of遍历元素值
        return exerciseHasRequiredMuscle ? {
          ...acc,
          [exercises[curr].type]: {
            ...acc[exercises[curr].type],
            [curr]: exercises[curr],
          },
        }
          : acc;
      }, { compound: {}, accessory: {} }
    )
    ;

  const genWOD = sets.map(({ setType, muscleGroup }) => {
    const data =
      setType === 'compound' ? compoundExercises : accessoryExercises
      ;
    const filteredObj = Object.keys(data).reduce(
      (acc, curr) => {
        if (
          includedTracker.includes(curr) || !data[curr].muscles.includes(muscleGroup)
        ) {
          return acc;
        }

        return { ...acc, [curr]: exercises[curr] };
      }, {}
    );

    const filteredDataList = Object.keys(filteredObj);

    const filteredOppList = Object.keys(
      setType === 'compound' ? accessoryExercises : compoundExercises
    ).filter((val) => !includedTracker.includes(val));

    let randomExercise =
      filteredDataList[
      Math.floor(Math.random() * filteredDataList.length)
      ] ||
      filteredOppList[
      Math.floor(Math.random() * filteredOppList.length)
      ]
      ;//filteredDataList是一个数组，在此返回的是filteredDataList[index]

    if (!randomExercise) {
      return {};
    }

    let repsOrDuraction =
      exercises[randomExercise].unit === 'reps'
        ? Math.min(...SCHEMES[scheme].repRanges) +
        Math.floor(
          Math.random() *
          (Math.max(...SCHEMES[scheme].repRanges) -
            Math.min(...SCHEMES[scheme].repRanges))
        ) +
        (setType === 'accessory' ? 4 : 0)
        : Math.floor(Math.random() * 40) + 20
      ;

    const tempo = TEMPOS[Math.floor(Math.random() * TEMPOS.length)];

    if (exercises[randomExercise].unit === 'reps') {
      const tempoSum = tempo
        .split(' ')
        .reduce((acc, curr) => acc + parseInt(curr), 0)
      ;

      if (tempoSum * parseInt(repsOrDuraction) > 85) {
        repsOrDuraction = Math.floor(85 / tempoSum);
      }
    } else {
      repsOrDuraction = Math.ceil(parseInt(repsOrDuraction) / 5) * 5;//ceil返回大于等于给定数字最小整数 即向上舍入；此处是时长取整处理，5的倍数
    }
    includedTracker.push(randomExercise);//避免后续重复选择

    return {
      name: randomExercise,
      tempo,
      rest: SCHEMES[scheme]['rest'][setType === 'compound' ? 0 : 1],
      reps: repsOrDuraction,
      ...exercises[randomExercise],
    };
  });

  return genWOD.filter(
    (element) => Object.keys(element).length > 0
  );
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }//Math.random()静态方法返回一个0-1(不含1)之间的随机浮点数

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
