import { Question } from './types';

export const ALL_QUESTIONS: Question[] = [
  // === MUSIC ===
  {
    id: 'music-1', type: 'multiple-choice', category: 'Music',
    question: 'Which artist had a hit with "Bohemian Rhapsody" in 1975?',
    options: ['Queen', 'The Beatles', 'Led Zeppelin', 'David Bowie'],
    correct: 'Queen', timeLimit: 30,
  },
  {
    id: 'music-2', type: 'multiple-choice', category: 'Music',
    question: 'Which singer released the album "Thriller" in 1982?',
    options: ['Michael Jackson', 'Prince', 'Madonna', 'Whitney Houston'],
    correct: 'Michael Jackson', timeLimit: 25,
  },
  {
    id: 'music-3', type: 'multiple-choice', category: 'Music',
    question: 'What year did Ed Sheeran release "Shape of You"?',
    options: ['2015', '2016', '2017', '2018'],
    correct: '2017', timeLimit: 30,
  },
  {
    id: 'music-4', type: 'multiple-choice', category: 'Music',
    question: 'Which band performed "Hotel California"?',
    options: ['The Eagles', 'Fleetwood Mac', 'The Doors', 'Lynyrd Skynyrd'],
    correct: 'The Eagles', timeLimit: 25,
  },
  {
    id: 'music-5', type: 'multiple-choice', category: 'Music',
    question: 'Who sang "Rolling in the Deep"?',
    options: ['Adele', 'Amy Winehouse', 'Beyoncé', 'Rihanna'],
    correct: 'Adele', timeLimit: 20,
  },
  {
    id: 'music-6', type: 'multiple-choice', category: 'Music',
    question: 'Which rapper released "Lose Yourself" in 2002?',
    options: ['Eminem', 'Jay-Z', '50 Cent', 'Kanye West'],
    correct: 'Eminem', timeLimit: 25,
  },
  {
    id: 'music-7', type: 'multiple-choice', category: 'Music',
    question: 'What is the best-selling album of all time?',
    options: ['Thriller – Michael Jackson', 'Back in Black – AC/DC', 'The Dark Side of the Moon – Pink Floyd', 'Eagles: Their Greatest Hits'],
    correct: 'Thriller – Michael Jackson', timeLimit: 30,
  },
  {
    id: 'music-8', type: 'multiple-choice', category: 'Music',
    question: 'Which country does the band ABBA originate from?',
    options: ['Sweden', 'Norway', 'Denmark', 'Finland'],
    correct: 'Sweden', timeLimit: 25,
  },
  {
    id: 'music-9', type: 'multiple-choice', category: 'Music',
    question: '"Blinding Lights" is a hit by which artist?',
    options: ['The Weeknd', 'Drake', 'Post Malone', 'Travis Scott'],
    correct: 'The Weeknd', timeLimit: 25,
  },
  {
    id: 'music-10', type: 'multiple-choice', category: 'Music',
    question: 'Who is known as the "Queen of Pop"?',
    options: ['Madonna', 'Lady Gaga', 'Beyoncé', 'Taylor Swift'],
    correct: 'Madonna', timeLimit: 20,
  },

  // === HISTORY ===
  {
    id: 'history-1', type: 'multiple-choice', category: 'History',
    question: 'In which year did the Berlin Wall fall?',
    options: ['1987', '1989', '1991', '1993'],
    correct: '1989', timeLimit: 30,
  },
  {
    id: 'history-2', type: 'multiple-choice', category: 'History',
    question: 'In which year did World War II end?',
    options: ['1943', '1944', '1945', '1946'],
    correct: '1945', timeLimit: 20,
  },
  {
    id: 'history-3', type: 'multiple-choice', category: 'History',
    question: 'Who was the first person to walk on the Moon?',
    options: ['Neil Armstrong', 'Buzz Aldrin', 'Yuri Gagarin', 'John Glenn'],
    correct: 'Neil Armstrong', timeLimit: 20,
  },
  {
    id: 'history-4', type: 'multiple-choice', category: 'History',
    question: 'In which year did Christopher Columbus reach the Americas?',
    options: ['1488', '1490', '1492', '1498'],
    correct: '1492', timeLimit: 25,
  },
  {
    id: 'history-5', type: 'multiple-choice', category: 'History',
    question: 'The French Revolution began in which year?',
    options: ['1776', '1783', '1789', '1799'],
    correct: '1789', timeLimit: 25,
  },
  {
    id: 'history-6', type: 'multiple-choice', category: 'History',
    question: 'Who was the first President of the United States?',
    options: ['George Washington', 'John Adams', 'Thomas Jefferson', 'Benjamin Franklin'],
    correct: 'George Washington', timeLimit: 20,
  },
  {
    id: 'history-7', type: 'multiple-choice', category: 'History',
    question: 'In which year did World War I begin?',
    options: ['1912', '1913', '1914', '1915'],
    correct: '1914', timeLimit: 25,
  },
  {
    id: 'history-8', type: 'multiple-choice', category: 'History',
    question: 'Which empire was known as "the empire on which the sun never sets"?',
    options: ['British Empire', 'Roman Empire', 'Ottoman Empire', 'Spanish Empire'],
    correct: 'British Empire', timeLimit: 30,
  },
  {
    id: 'history-9', type: 'multiple-choice', category: 'History',
    question: 'Who painted the Mona Lisa?',
    options: ['Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Botticelli'],
    correct: 'Leonardo da Vinci', timeLimit: 20,
  },
  {
    id: 'history-10', type: 'multiple-choice', category: 'History',
    question: 'In which city was the Titanic built?',
    options: ['Liverpool', 'London', 'Belfast', 'Glasgow'],
    correct: 'Belfast', timeLimit: 30,
  },

  // === SPORTS ===
  {
    id: 'sports-1', type: 'multiple-choice', category: 'Sports',
    question: 'How often is the FIFA World Cup held?',
    options: ['Every 2 years', 'Every 3 years', 'Every 4 years', 'Every 5 years'],
    correct: 'Every 4 years', timeLimit: 20,
  },
  {
    id: 'sports-2', type: 'multiple-choice', category: 'Sports',
    question: 'Who holds the record for most Olympic gold medals?',
    options: ['Usain Bolt', 'Michael Phelps', 'Carl Lewis', 'Mark Spitz'],
    correct: 'Michael Phelps', timeLimit: 25,
  },
  {
    id: 'sports-3', type: 'multiple-choice', category: 'Sports',
    question: 'Which country won the 2018 FIFA World Cup?',
    options: ['Brazil', 'Germany', 'France', 'Croatia'],
    correct: 'France', timeLimit: 25,
  },
  {
    id: 'sports-4', type: 'multiple-choice', category: 'Sports',
    question: 'In which sport does a player use a shuttlecock?',
    options: ['Squash', 'Badminton', 'Tennis', 'Ping Pong'],
    correct: 'Badminton', timeLimit: 20,
  },
  {
    id: 'sports-5', type: 'multiple-choice', category: 'Sports',
    question: 'How many players are on a basketball team on court at once?',
    options: ['4', '5', '6', '7'],
    correct: '5', timeLimit: 20,
  },
  {
    id: 'sports-6', type: 'multiple-choice', category: 'Sports',
    question: 'Which tennis player has won the most Grand Slam titles (men\'s)?',
    options: ['Roger Federer', 'Rafael Nadal', 'Novak Djokovic', 'Pete Sampras'],
    correct: 'Novak Djokovic', timeLimit: 30,
  },
  {
    id: 'sports-7', type: 'multiple-choice', category: 'Sports',
    question: 'The Tour de France is primarily a race of which type?',
    options: ['Running', 'Cycling', 'Skiing', 'Swimming'],
    correct: 'Cycling', timeLimit: 20,
  },
  {
    id: 'sports-8', type: 'multiple-choice', category: 'Sports',
    question: 'In which country did the 2022 FIFA World Cup take place?',
    options: ['UAE', 'Saudi Arabia', 'Qatar', 'Bahrain'],
    correct: 'Qatar', timeLimit: 25,
  },
  {
    id: 'sports-9', type: 'multiple-choice', category: 'Sports',
    question: 'How many rings are on the Olympic flag?',
    options: ['4', '5', '6', '7'],
    correct: '5', timeLimit: 20,
  },
  {
    id: 'sports-10', type: 'multiple-choice', category: 'Sports',
    question: 'Which sport is played at Wimbledon?',
    options: ['Golf', 'Cricket', 'Tennis', 'Polo'],
    correct: 'Tennis', timeLimit: 15,
  },

  // === MOVIES ===
  {
    id: 'movies-1', type: 'multiple-choice', category: 'Movies',
    question: 'Which film won the Oscar for Best Picture in 2020?',
    options: ['1917', 'Joker', 'Parasite', 'Once Upon a Time in Hollywood'],
    correct: 'Parasite', timeLimit: 30,
  },
  {
    id: 'movies-2', type: 'multiple-choice', category: 'Movies',
    question: 'Who directed the movie "Inception"?',
    options: ['Steven Spielberg', 'Christopher Nolan', 'James Cameron', 'Ridley Scott'],
    correct: 'Christopher Nolan', timeLimit: 25,
  },
  {
    id: 'movies-3', type: 'multiple-choice', category: 'Movies',
    question: 'In which year was the first Star Wars film released?',
    options: ['1975', '1977', '1979', '1981'],
    correct: '1977', timeLimit: 25,
  },
  {
    id: 'movies-4', type: 'multiple-choice', category: 'Movies',
    question: 'What is the highest-grossing film of all time?',
    options: ['Avengers: Endgame', 'Titanic', 'Avatar', 'The Lion King'],
    correct: 'Avatar', timeLimit: 30,
  },
  {
    id: 'movies-5', type: 'multiple-choice', category: 'Movies',
    question: 'Who plays Iron Man in the Marvel Cinematic Universe?',
    options: ['Chris Evans', 'Chris Hemsworth', 'Robert Downey Jr.', 'Mark Ruffalo'],
    correct: 'Robert Downey Jr.', timeLimit: 20,
  },
  {
    id: 'movies-6', type: 'multiple-choice', category: 'Movies',
    question: 'Which director made "Schindler\'s List"?',
    options: ['Martin Scorsese', 'Francis Ford Coppola', 'Steven Spielberg', 'Oliver Stone'],
    correct: 'Steven Spielberg', timeLimit: 25,
  },
  {
    id: 'movies-7', type: 'multiple-choice', category: 'Movies',
    question: 'The movie "Titanic" was released in which year?',
    options: ['1995', '1996', '1997', '1998'],
    correct: '1997', timeLimit: 25,
  },
  {
    id: 'movies-8', type: 'multiple-choice', category: 'Movies',
    question: 'Which actor played Forrest Gump?',
    options: ['Tom Cruise', 'Tom Hanks', 'Tom Hiddleston', 'Jim Carrey'],
    correct: 'Tom Hanks', timeLimit: 20,
  },
  {
    id: 'movies-9', type: 'multiple-choice', category: 'Movies',
    question: 'What is the name of the toy cowboy in Toy Story?',
    options: ['Buzz', 'Rex', 'Woody', 'Hamm'],
    correct: 'Woody', timeLimit: 20,
  },
  {
    id: 'movies-10', type: 'multiple-choice', category: 'Movies',
    question: 'Which film features the line "I\'ll be back"?',
    options: ['RoboCop', 'Total Recall', 'The Terminator', 'Predator'],
    correct: 'The Terminator', timeLimit: 25,
  },

  // === GENERAL KNOWLEDGE ===
  {
    id: 'gk-1', type: 'multiple-choice', category: 'General Knowledge',
    question: 'What is the capital city of Australia?',
    options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'],
    correct: 'Canberra', timeLimit: 25,
  },
  {
    id: 'gk-2', type: 'multiple-choice', category: 'General Knowledge',
    question: 'Which planet is the largest in our solar system?',
    options: ['Saturn', 'Neptune', 'Jupiter', 'Uranus'],
    correct: 'Jupiter', timeLimit: 20,
  },
  {
    id: 'gk-3', type: 'multiple-choice', category: 'General Knowledge',
    question: 'At what temperature does water boil at sea level?',
    options: ['90°C', '95°C', '100°C', '105°C'],
    correct: '100°C', timeLimit: 15,
  },
  {
    id: 'gk-4', type: 'multiple-choice', category: 'General Knowledge',
    question: 'How many bones are in the adult human body?',
    options: ['196', '206', '216', '226'],
    correct: '206', timeLimit: 25,
  },
  {
    id: 'gk-5', type: 'multiple-choice', category: 'General Knowledge',
    question: 'Which is the longest river in the world?',
    options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'],
    correct: 'Nile', timeLimit: 25,
  },
  {
    id: 'gk-6', type: 'multiple-choice', category: 'General Knowledge',
    question: 'What is the most spoken language in the world?',
    options: ['English', 'Spanish', 'Hindi', 'Mandarin Chinese'],
    correct: 'Mandarin Chinese', timeLimit: 25,
  },
  {
    id: 'gk-7', type: 'multiple-choice', category: 'General Knowledge',
    question: 'How many continents are there on Earth?',
    options: ['5', '6', '7', '8'],
    correct: '7', timeLimit: 15,
  },
  {
    id: 'gk-8', type: 'multiple-choice', category: 'General Knowledge',
    question: 'Which country has the largest population?',
    options: ['India', 'USA', 'China', 'Indonesia'],
    correct: 'India', timeLimit: 25,
  },
  {
    id: 'gk-9', type: 'multiple-choice', category: 'General Knowledge',
    question: 'What is the chemical symbol for gold?',
    options: ['Go', 'Gd', 'Au', 'Ag'],
    correct: 'Au', timeLimit: 25,
  },
  {
    id: 'gk-10', type: 'multiple-choice', category: 'General Knowledge',
    question: 'Which ocean is the largest?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    correct: 'Pacific', timeLimit: 20,
  },

  // === TECHNOLOGY ===
  {
    id: 'tech-1', type: 'multiple-choice', category: 'Technology',
    question: 'Who invented the World Wide Web?',
    options: ['Bill Gates', 'Steve Jobs', 'Tim Berners-Lee', 'Linus Torvalds'],
    correct: 'Tim Berners-Lee', timeLimit: 25,
  },
  {
    id: 'tech-2', type: 'multiple-choice', category: 'Technology',
    question: 'In which year was Apple Inc. founded?',
    options: ['1974', '1975', '1976', '1977'],
    correct: '1976', timeLimit: 25,
  },
  {
    id: 'tech-3', type: 'multiple-choice', category: 'Technology',
    question: 'What does "CPU" stand for?',
    options: ['Central Processing Unit', 'Core Processing Unit', 'Computer Processing Unit', 'Central Program Unit'],
    correct: 'Central Processing Unit', timeLimit: 20,
  },
  {
    id: 'tech-4', type: 'multiple-choice', category: 'Technology',
    question: 'Which company created the Python programming language?',
    options: ['Microsoft', 'Google', 'It was created by Guido van Rossum', 'IBM'],
    correct: 'It was created by Guido van Rossum', timeLimit: 30,
  },
  {
    id: 'tech-5', type: 'multiple-choice', category: 'Technology',
    question: 'In which year was Facebook launched?',
    options: ['2002', '2003', '2004', '2005'],
    correct: '2004', timeLimit: 20,
  },
  {
    id: 'tech-6', type: 'multiple-choice', category: 'Technology',
    question: 'What does "HTTP" stand for?',
    options: ['HyperText Transfer Protocol', 'High Text Transfer Process', 'HyperText Transmission Protocol', 'Hyper Transfer Text Protocol'],
    correct: 'HyperText Transfer Protocol', timeLimit: 25,
  },
  {
    id: 'tech-7', type: 'multiple-choice', category: 'Technology',
    question: 'Which company makes the iPhone?',
    options: ['Samsung', 'Apple', 'Google', 'Sony'],
    correct: 'Apple', timeLimit: 10,
  },
  {
    id: 'tech-8', type: 'multiple-choice', category: 'Technology',
    question: 'What is the name of the virtual assistant created by Amazon?',
    options: ['Cortana', 'Siri', 'Alexa', 'Google Assistant'],
    correct: 'Alexa', timeLimit: 20,
  },
  {
    id: 'tech-9', type: 'multiple-choice', category: 'Technology',
    question: 'Which programming language is primarily used for web styling?',
    options: ['HTML', 'JavaScript', 'CSS', 'Python'],
    correct: 'CSS', timeLimit: 20,
  },
  {
    id: 'tech-10', type: 'multiple-choice', category: 'Technology',
    question: 'What does "RAM" stand for?',
    options: ['Random Access Memory', 'Read Access Memory', 'Rapid Access Module', 'Random Allocation Memory'],
    correct: 'Random Access Memory', timeLimit: 20,
  },
];

export function getQuestionsByCategories(categories: string[], count: number): Question[] {
  let pool = categories.length > 0
    ? ALL_QUESTIONS.filter(q => categories.includes(q.category))
    : ALL_QUESTIONS;

  if (pool.length === 0) pool = ALL_QUESTIONS;

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getDurationConfig(duration: string): { totalQuestions: number; questionsPerRound: number; totalRounds: number } {
  switch (duration) {
    case 'short':  return { totalQuestions: 10, questionsPerRound: 5, totalRounds: 2 };
    case 'medium': return { totalQuestions: 20, questionsPerRound: 5, totalRounds: 4 };
    case 'long':   return { totalQuestions: 30, questionsPerRound: 5, totalRounds: 6 };
    default:       return { totalQuestions: 10, questionsPerRound: 5, totalRounds: 2 };
  }
}
