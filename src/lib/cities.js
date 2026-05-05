// Multi-city data for Pulse Explore view
// Each city has its own issues, map bounds, and center

export const CITIES = [
  {
    id: 'oshkosh',
    name: 'Oshkosh',
    state: 'WI',
    label: 'Oshkosh, WI',
    center: { lat: 44.0247, lng: -88.5426 },
    bounds: { north: 44.045, south: 44.005, east: -88.515, west: -88.575 },
    isHome: true,
    population: '66,816'
  },
  {
    id: 'santa-barbara',
    name: 'Santa Barbara',
    state: 'CA',
    label: 'Santa Barbara, CA',
    center: { lat: 34.4208, lng: -119.6982 },
    bounds: { north: 34.445, south: 34.400, east: -119.670, west: -119.730 },
    isHome: false,
    population: '88,665'
  },
  {
    id: 'austin',
    name: 'Austin',
    state: 'TX',
    label: 'Austin, TX',
    center: { lat: 30.2672, lng: -97.7431 },
    bounds: { north: 30.290, south: 30.245, east: -97.715, west: -97.775 },
    isHome: false,
    population: '964,177'
  },
  {
    id: 'madison',
    name: 'Madison',
    state: 'WI',
    label: 'Madison, WI',
    center: { lat: 43.0731, lng: -89.4012 },
    bounds: { north: 43.095, south: 43.055, east: -89.370, west: -89.430 },
    isHome: false,
    population: '269,840'
  },
  {
    id: 'boulder',
    name: 'Boulder',
    state: 'CO',
    label: 'Boulder, CO',
    center: { lat: 40.0150, lng: -105.2705 },
    bounds: { north: 40.035, south: 39.995, east: -105.240, west: -105.300 },
    isHome: false,
    population: '105,673'
  }
]

// Sample issues for other cities (Oshkosh issues come from SEED_POSTS)
export const CITY_ISSUES = {
  'santa-barbara': [
    {
      id: 'sb-1',
      title: 'Beach erosion near Leadbetter Point is accelerating',
      description: 'The cliffs near Leadbetter have lost 6 feet this year. Walkway is crumbling. City needs to act before the parking lot goes.',
      category: 'parks',
      location: 'Leadbetter Beach',
      votes: 312,
      userVote: 0,
      comments: [
        { id: 'sbc1', author: 'CoastWatcher', text: 'I surfed here 20 years ago and there was twice the beach.', timestamp: Date.now() - 86400000 }
      ],
      incognito: false,
      author: 'Elena M.',
      authorVerified: true,
      createdAt: '6h ago',
      userId: 'other',
      lat: 34.410,
      lng: -119.710
    },
    {
      id: 'sb-2',
      title: 'State St rent is killing small businesses',
      description: 'Three more shops closed this month. Landlords raising rent 40% while storefronts sit empty. This is destroying our downtown.',
      category: 'business',
      location: 'State Street',
      votes: 487,
      userVote: 0,
      comments: [
        { id: 'sbc2', author: 'LocalShopOwner', text: 'My lease went from $4,200 to $5,900. I can\'t survive this.', timestamp: Date.now() - 43200000 }
      ],
      incognito: false,
      author: 'Carlos R.',
      authorVerified: true,
      createdAt: '1d ago',
      userId: 'other',
      lat: 34.422,
      lng: -119.700
    },
    {
      id: 'sb-3',
      title: 'MTD bus line 11 needs weekend service',
      description: 'No weekend bus to Goleta means service workers have no transit option. We voted for the transit tax — where\'s the service?',
      category: 'transit',
      location: 'Goleta Route',
      votes: 189,
      userVote: 0,
      comments: [],
      incognito: true,
      author: null,
      authorVerified: true,
      createdAt: '2d ago',
      userId: 'other',
      lat: 34.430,
      lng: -119.685
    },
    {
      id: 'sb-4',
      title: 'Potholes on Milpas St are destroying tires',
      description: 'Between Haley and Gutierrez there are at least 8 potholes deep enough to damage a rim. Been reported for months.',
      category: 'pothole',
      location: 'Milpas St',
      votes: 156,
      userVote: 0,
      comments: [],
      incognito: false,
      author: 'James W.',
      authorVerified: true,
      createdAt: '3d ago',
      userId: 'other',
      lat: 34.418,
      lng: -119.692
    },
    {
      id: 'sb-5',
      title: 'New bike lanes on Cabrillo are fantastic',
      description: 'Finally a safe way to bike along the waterfront. Thank you to whoever pushed this through council. More of this please.',
      category: 'compliment',
      location: 'Cabrillo Blvd',
      votes: 341,
      userVote: 0,
      comments: [
        { id: 'sbc3', author: 'BikeCommuter', text: 'I bike to work now instead of driving. Game changer.', timestamp: Date.now() - 172800000 }
      ],
      incognito: false,
      author: 'Maya T.',
      authorVerified: true,
      createdAt: '4d ago',
      userId: 'other',
      lat: 34.415,
      lng: -119.705
    },
    {
      id: 'sb-6',
      title: 'Noise from Funk Zone bars until 2am every night',
      description: 'The residential blocks adjacent to the Funk Zone get zero peace. Bass vibrates through the walls. Ordinance enforcement is nonexistent.',
      category: 'noise',
      location: 'Funk Zone',
      votes: 98,
      userVote: 0,
      comments: [],
      incognito: true,
      author: null,
      authorVerified: true,
      createdAt: '5d ago',
      userId: 'other',
      lat: 34.413,
      lng: -119.695
    }
  ],
  'austin': [
    {
      id: 'atx-1',
      title: 'I-35 construction has been "2 years" for 5 years',
      description: 'The never-ending construction on I-35 through downtown is destroying commute times and small businesses along the frontage roads.',
      category: 'transit',
      location: 'I-35 Downtown',
      votes: 892,
      userVote: 0,
      comments: [
        { id: 'atxc1', author: 'ATXcommuter', text: 'My 20 minute commute is now 55 minutes. Every day.', timestamp: Date.now() - 3600000 }
      ],
      incognito: false,
      author: 'Priya K.',
      authorVerified: true,
      createdAt: '3h ago',
      userId: 'other',
      lat: 30.270,
      lng: -97.740
    },
    {
      id: 'atx-2',
      title: 'East side gentrification is pushing families out',
      description: 'Property taxes doubled in 3 years. Families who have been here for generations can\'t afford to stay. This isn\'t progress.',
      category: 'housing',
      location: 'East Austin',
      votes: 634,
      userVote: 0,
      comments: [],
      incognito: true,
      author: null,
      authorVerified: true,
      createdAt: '1d ago',
      userId: 'other',
      lat: 30.262,
      lng: -97.725
    },
    {
      id: 'atx-3',
      title: 'Zilker Park needs better shade structures',
      description: 'Kids and families can\'t use the playgrounds in summer — zero shade. Heat index hits 110°F on the equipment.',
      category: 'parks',
      location: 'Zilker Park',
      votes: 423,
      userVote: 0,
      comments: [],
      incognito: false,
      author: 'Amanda J.',
      authorVerified: true,
      createdAt: '2d ago',
      userId: 'other',
      lat: 30.267,
      lng: -97.770
    },
    {
      id: 'atx-4',
      title: 'Thank you for the South Lamar bike improvements',
      description: 'The protected bike lanes on South Lamar are saving lives. Three cyclists were hit last year on this stretch. This matters.',
      category: 'compliment',
      location: 'South Lamar',
      votes: 567,
      userVote: 0,
      comments: [],
      incognito: false,
      author: 'Marcus B.',
      authorVerified: true,
      createdAt: '4d ago',
      userId: 'other',
      lat: 30.255,
      lng: -97.760
    }
  ],
  'madison': [
    {
      id: 'mad-1',
      title: 'State Capitol square parking is impossible',
      description: 'Downtown workers spend 30+ minutes looking for parking daily. Meters max at 2 hours. There has to be a better system.',
      category: 'transit',
      location: 'Capitol Square',
      votes: 234,
      userVote: 0,
      comments: [],
      incognito: false,
      author: 'Sarah L.',
      authorVerified: true,
      createdAt: '4h ago',
      userId: 'other',
      lat: 43.075,
      lng: -89.400
    },
    {
      id: 'mad-2',
      title: 'Ice damage on Williamson St sidewalks still not fixed',
      description: 'The freeze-thaw cycle destroyed 4 blocks of sidewalk on Willy St. It\'s April and still tripping hazards everywhere.',
      category: 'pothole',
      location: 'Williamson St',
      votes: 156,
      userVote: 0,
      comments: [],
      incognito: false,
      author: 'Mike D.',
      authorVerified: true,
      createdAt: '2d ago',
      userId: 'other',
      lat: 43.080,
      lng: -89.375
    },
    {
      id: 'mad-3',
      title: 'Dane County Farmers Market is the best in the Midwest',
      description: 'Saturday mornings on the square are what make Madison special. Thank you to every vendor who shows up rain or shine.',
      category: 'compliment',
      location: 'Capitol Square',
      votes: 567,
      userVote: 0,
      comments: [],
      incognito: false,
      author: 'Keisha J.',
      authorVerified: true,
      createdAt: '3d ago',
      userId: 'other',
      lat: 43.074,
      lng: -89.402
    }
  ],
  'boulder': [
    {
      id: 'bou-1',
      title: 'Pearl Street Mall needs better busker management',
      description: 'Love the performers but the amplified music from 3 acts within 50 feet of each other is chaos. Needs designated spots.',
      category: 'noise',
      location: 'Pearl Street Mall',
      votes: 178,
      userVote: 0,
      comments: [],
      incognito: false,
      author: 'Lisa C.',
      authorVerified: true,
      createdAt: '5h ago',
      userId: 'other',
      lat: 40.018,
      lng: -105.275
    },
    {
      id: 'bou-2',
      title: 'Chautauqua Trail erosion needs attention',
      description: 'The main trail to the Flatirons is eroding badly. Drainage issues are creating gullies in the path. Someone will get hurt.',
      category: 'parks',
      location: 'Chautauqua Park',
      votes: 289,
      userVote: 0,
      comments: [],
      incognito: false,
      author: 'David K.',
      authorVerified: true,
      createdAt: '1d ago',
      userId: 'other',
      lat: 40.000,
      lng: -105.280
    },
    {
      id: 'bou-3',
      title: 'Median home price just hit $900K — where do workers live?',
      description: 'Teachers, firefighters, baristas — none of them can afford to live here. The city needs to address workforce housing now.',
      category: 'housing',
      location: 'Citywide',
      votes: 445,
      userVote: 0,
      comments: [
        { id: 'bouc1', author: 'TeacherInBoulder', text: 'I commute 45 minutes from Longmont because I can\'t afford Boulder.', timestamp: Date.now() - 86400000 }
      ],
      incognito: true,
      author: null,
      authorVerified: true,
      createdAt: '2d ago',
      userId: 'other',
      lat: 40.015,
      lng: -105.270
    }
  ]
}
