export const mockCategories = [
  {_id: 0, name: 'Philosophy'},
  {_id: 1, name: 'Health'},
  {_id: 2, name: 'Business'},
  {_id: 3, name: 'Technology'},
  {_id: 4, name: 'Tools'},
  {_id: 5, name: 'Study'},
  {_id: 6, name: 'Misc'},
]

export const mockThreads = [
  { _id: 0, name: 'Social network design', tags: ['System Architect', 'Social network', 'Database', 'Mongodb', 'NodeJs', 'Performance'] },
  { _id: 1, name: 'Bug investigation', tags: ['Bug', 'Blame'] },
  { _id: 2, name: 'Performance', tags: [] },
]

export const mockPosts = [
  {
    _id: 0,
    createAt: new Date(),
    text: 'Stay hungry, stay foolish',
    audio: '',
    photos: [
      'https://s.yimg.com/uu/api/res/1.2/GbXNKC1GDtCyf71.D43aAA--~B/Zmk9ZmlsbDtoPTc5Nzt3PTg3NTthcHBpZD15dGFjaHlvbg--/https://www.blogcdn.com/www.engadget.com/media/2011/10/steve-jobs.jpg.cf.webp'
    ],
    videos: [],
    comments: [
      { _id: 1, text: 'Nice', byUser: { _id: 0, fullName: 'Van Anh Hoang' }},
      { _id: 2, text: 'Bring back our Jobs', byUser: { _id: 0, fullName: 'Nguyễn Kiều Oanh' }}
    ]
  },
  {
    _id: 1,
    createAt: new Date(),
    text: "You've never lived this day before and you never will again so make the most of it",
    audio: '',
    photos: [],
    videos: [],
    comments: [
      { _id: 1, text: 'Agree!', byUser: { _id: 0, fullName: 'Hạt Cát' }}
    ]
  },
  {
    _id: 2,
    createAt: new Date(),
    text: "You've never lived this day before and you never will again so make the most of it",
    audio: '',
    photos: [],
    videos: [],
    comments: [
      { _id: 1, text: 'Agree!', byUser: { _id: 0, fullName: 'Hạt Cát' }}
    ]
  },
  {
    _id: 3,
    createAt: new Date(),
    text: "You've never lived this day before and you never will again so make the most of it",
    audio: '',
    photos: [],
    videos: [],
    comments: [
      { _id: 1, text: 'Agree!', byUser: { _id: 0, fullName: 'Hạt Cát' }}
    ]
  }
]
