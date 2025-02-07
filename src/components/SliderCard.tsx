import { IMovie } from "@/db/models/Movie";

export interface SliderCardProps {
  movie: IMovie;
  // todaysWorkout: Workout;
  // setTodaysWorkout: (workout: Workout) => void;
  // formWorkout: Workout;
  // setFormWorkout: (workout: Workout) => void;
  // details: boolean;
  // setDetails: (details: boolean) => void;
  // toggleDetails: () => void;
  // deleteWorkout: (deletedWorkout: Workout) => void;
  // updateWorkout: (updatedWorkout: Workout) => void;
  // setIsEditing: (isEditing: boolean) => void;
  // isEditing: boolean;
}

export default function SliderCard(props: Readonly<SliderCardProps>) {
  const { movie } = props;

  return (
    <>
      <h2>
        {movie.title} ({movie.year})
      </h2>
      <p>{movie.overview}</p>
      <img src={movie.imgImdb} alt={movie.title} width="200" />
    </>
  );
}
