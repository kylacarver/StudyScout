-- StudyScout seed data for spots
insert into public.spots (
  id, name, area, spot_type, description, noise, crowd, outlets, wifi, comfort, productivity,
  late_night, food_nearby, best_for, tips, busy_spike
)
values
  (
    1, 'Carrier Library', 'Main Campus', 'Library',
    'Carrier Library offers multiple study areas, including quieter upper floors and busier lower levels. It is often crowded during exam periods.',
    'Mixed', 'High', 4, 5, 4, 5, false, true,
    array['Finals grind', 'Solo studying', 'Late night'],
    'Go upstairs if you need quiet. First floor gets loud fast.',
    'weekday_peak'
  ),
  (
    2, 'Rose Library', 'East Campus', 'Library',
    'Rose Library is generally quieter than Carrier and has good natural light. It is a good option for focused study sessions.',
    'Quiet', 'Medium', 4, 5, 4, 5, true, true,
    array['Quiet studying', 'STEM homework', 'Long sessions'],
    'Great escape when Carrier feels like a concert.',
    'weekday_peak'
  ),
  (
    3, 'Student Success Center', 'Main Campus', 'Student Center',
    'The Student Success Center has steady daytime traffic due to nearby tutoring and advising services. It is well suited for studying between classes.',
    'Mixed', 'Medium', 3, 5, 3, 4, false, true,
    array['Between classes', 'Group work', 'Daytime studying'],
    'Better for shorter blocks than deep focus.',
    'between_classes'
  ),
  (
    4, 'Festival Conference & Student Center', 'East Campus', 'Student Center',
    'Festival provides a casual environment with frequent activity and nearby dining. It is better for group work than quiet individual study.',
    'Loud', 'Medium', 3, 4, 3, 3, false, true,
    array['Group projects', 'Food nearby', 'Casual work'],
    'Expect chatter-bring headphones.',
    'lunch'
  ),
  (
    5, 'EnGeo / King Hall', 'East Campus', 'Academic Building',
    'EnGeo and King Hall are typically less crowded and usually have available seating. They are useful alternatives when library spaces are busy.',
    'Quiet', 'Low', 3, 4, 3, 4, false, false,
    array['Hidden gem', 'Quiet studying', 'Low crowd'],
    'Not glamorous, but reliably calm.',
    'none'
  ),
  (
    6, 'Taylor Down Under / The Union', 'Main Campus', 'Student Center',
    'Taylor Down Under in The Union is centrally located and usually active throughout the day. It is convenient for shorter sessions and meeting with classmates.',
    'Mixed', 'High', 3, 4, 3, 3, true, true,
    array['Between classes', 'Food nearby', 'Late night'],
    'Good for quick sessions if you can grab a quieter corner.',
    'lunch'
  ),
  (
    7, 'College of Business (CoB)', 'Main Campus', 'Academic Building',
    'The College of Business has modern study spaces and generally reliable seating. It is convenient for students with classes on main campus.',
    'Mixed', 'Medium', 4, 5, 4, 4, false, false,
    array['Between classes', 'Solo studying', 'STEM homework'],
    'Try upper-floor spaces for better focus.',
    'between_classes'
  )
on conflict (id) do update
set
  name = excluded.name,
  area = excluded.area,
  spot_type = excluded.spot_type,
  description = excluded.description,
  noise = excluded.noise,
  crowd = excluded.crowd,
  outlets = excluded.outlets,
  wifi = excluded.wifi,
  comfort = excluded.comfort,
  productivity = excluded.productivity,
  late_night = excluded.late_night,
  food_nearby = excluded.food_nearby,
  best_for = excluded.best_for,
  tips = excluded.tips,
  busy_spike = excluded.busy_spike;
