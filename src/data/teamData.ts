export interface IPLTeam {
  name: string;
  short: string;
  captain: string;
  logo: string;
  players: string[];
  homeGround: string;
}

export const iplTeams2026: IPLTeam[] = [
  {
    name: 'Gujarat Titans',
    short: 'GT',
    captain: 'Shubman Gill',
    logo: 'GT',
    homeGround: 'Narendra Modi Stadium, Ahmedabad',
    players: ['Shubman Gill', 'Sai Sudharsan', 'Jos Buttler', 'Shahrukh Khan', 'Rahul Tewatia', 'Washington Sundar', 'Glenn Phillips', 'Jason Holder', 'Rashid Khan', 'Kagiso Rabada', 'Mohammed Siraj', 'Prasidh Krishna', 'Ishant Sharma', 'Sai Kishore', 'Jayant Yadav', 'Nishant Sindhu', 'Manav Suthar', 'Anuj Rawat', 'Kumar Kushagra', 'Tom Banton', 'Gurnoor Brar', 'Luke Wood', 'Ashok Sharma', 'Kulwant Khejroliya'],
  },
  {
    name: 'Sunrisers Hyderabad',
    short: 'SRH',
    captain: 'Pat Cummins',
    logo: 'SRH',
    homeGround: 'Rajiv Gandhi International Stadium, Hyderabad',
    players: ['Pat Cummins', 'Travis Head', 'Abhishek Sharma', 'Ishan Kishan', 'Heinrich Klaasen', 'Nitish Kumar Reddy', 'Harshal Patel', 'Jaydev Unadkat', 'Eshan Malinga', 'Zeeshan Ansari', 'Liam Livingstone', 'Kamindu Mendis', 'Brydon Carse', 'Shivam Mavi', 'Aniket Verma', 'Smaran Ravichandran', 'Harsh Dubey', 'Salil Arora', 'Shivang Kumar', 'Onkar Tarmale', 'Krains Fuletra', 'Praful Hinge', 'Amit Kumar', 'Sakib Hussain', 'Jack Edwards'],
  },
  {
    name: 'Mumbai Indians',
    short: 'MI',
    captain: 'Hardik Pandya',
    logo: 'MI',
    homeGround: 'Wankhede Stadium, Mumbai',
    players: ['Rohit Sharma', 'Ishan Kishan', 'Suryakumar Yadav', 'Hardik Pandya', 'Kieron Pollard', 'Tim David', 'Dewald Brevis', 'Jasprit Bumrah', 'Trent Boult', 'Piyush Chawla', 'Kumar Kartikeya', 'Akash Madhwal'],
  },
  {
    name: 'Chennai Super Kings',
    short: 'CSK',
    captain: 'Ruturaj Gaikwad',
    logo: 'CSK',
    homeGround: 'M. A. Chidambaram Stadium, Chennai',
    players: ['Ruturaj Gaikwad', 'Devon Conway', 'Shivam Dube', 'Moeen Ali', 'Ravindra Jadeja', 'MS Dhoni', 'Deepak Chahar', 'Tushar Deshpande', 'Matheesha Pathirana', 'Maheesh Theekshana', 'Ajinkya Rahane'],
  },
  {
    name: 'Royal Challengers Bengaluru',
    short: 'RCB',
    captain: 'Virat Kohli',
    logo: 'RCB',
    homeGround: 'M. Chinnaswamy Stadium, Bengaluru',
    players: ['Virat Kohli', 'Faf du Plessis', 'Glenn Maxwell', 'Raj Patidar', 'Cameron Green', 'Dinesh Karthik', 'Mohammed Siraj', 'Wanindu Hasaranga', 'Josh Hazlewood', 'Yash Dayal', 'Alzarri Joseph'],
  },
  {
    name: 'Kolkata Knight Riders',
    short: 'KKR',
    captain: 'Shreyas Iyer',
    logo: 'KKR',
    homeGround: 'Eden Gardens, Kolkata',
    players: ['Shreyas Iyer', 'Sunil Narine', 'Andre Russell', 'Rinku Singh', 'Venkatesh Iyer', 'Nitish Rana', 'Varun Chakaravarthy', 'Pat Cummins', 'Mitchell Starc', 'Harshit Rana', 'Ramandeep Singh'],
  },
  {
    name: 'Rajasthan Royals',
    short: 'RR',
    captain: 'Sanju Samson',
    logo: 'RR',
    homeGround: 'Sawai Mansingh Stadium, Jaipur',
    players: ['Sanju Samson', 'Jos Buttler', 'Yashasvi Jaiswal', 'Riyan Parag', 'Shimron Hetmyer', 'Dhruv Jurel', 'Ravichandran Ashwin', 'Trent Boult', 'Sandeep Sharma', 'Yuzvendra Chahal', 'Avesh Khan'],
  },
  {
    name: 'Delhi Capitals',
    short: 'DC',
    captain: 'Rishabh Pant',
    logo: 'DC',
    homeGround: 'Arun Jaitley Stadium, Delhi',
    players: ['Rishabh Pant', 'David Warner', 'Shikhar Dhawan', 'Mitchell Marsh', 'Axar Patel', 'Anrich Nortje', 'Kagiso Rabada', 'Kuldeep Yadav', 'Prithvi Shaw', 'Lalit Yadav', 'Mukesh Kumar'],
  },
  {
    name: 'Punjab Kings',
    short: 'PBKS',
    captain: 'Shikhar Dhawan',
    logo: 'PBKS',
    homeGround: 'PCA Stadium, Mohali',
    players: ['Shikhar Dhawan', 'Jonny Bairstow', 'Sam Curran', 'Liam Livingstone', 'Atharva Taide', 'Jitesh Sharma', 'Kagiso Rabada', 'Arshdeep Singh', 'Rahul Chahar', 'Harpreet Brar', 'Nathan Ellis'],
  },
  {
    name: 'Lucknow Super Giants',
    short: 'LSG',
    captain: 'KL Rahul',
    logo: 'LSG',
    homeGround: 'Ekana Stadium, Lucknow',
    players: ['KL Rahul', 'Quinton de Kock', 'Marcus Stoinis', 'Nicholas Pooran', 'Deepak Hooda', 'Krunal Pandya', 'Ravi Bishnoi', 'Mark Wood', 'Avesh Khan', 'Mohan Singh', 'Ayush Badoni'],
  },
];

export function findTeam(short: string): IPLTeam | undefined {
  return iplTeams2026.find(
    (t) => t.short.toLowerCase() === short.toLowerCase() || t.name.toLowerCase().includes(short.toLowerCase())
  );
}

export function findTeamByPlayer(playerName: string): IPLTeam | undefined {
  const search = playerName.toLowerCase();
  return iplTeams2026.find((t) =>
    t.players.some((p) => p.toLowerCase().includes(search))
  );
}
