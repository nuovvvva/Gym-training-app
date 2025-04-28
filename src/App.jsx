import { useState } from "react"
import Generator from "./components/Generator"
import Hero from "./components/Hero"
import Workout from "./components/Workout"


function App() {
  const [workout, setworkout] = useState(null)
  const [poison, setPoison] = useState('individual')//workout type 训练计划(俚语话表达)
  const [muscles, setMuscles] = useState([])
  const [goal, setGoal] = useState('strength_power')



  return (
    <main className='min-h-screen flex flex-col bg-gradient-to-r from-slate-800 to-slate-950 text-white text-sm sm:text-base'>
      <Hero />
      <Generator
        poison={poison} setPoison={setPoison}
        muscles={muscles} setMuscles={setMuscles}
        goal={goal} setGoal={setGoal}
      />
      {workout && (<Workout workout={workout} />)}
    </main>
  )
}

export default App
