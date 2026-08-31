import { useEffect, useState } from 'react'
import { useCart } from '../../context/useCart.js'
import './Menu.css'

const appetizers = [
  {
    name: 'Cestino di Pane',
    description: 'A basket of homemade bread.',
    dietary: ['VG'],
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85',
    price: '£4.25',
  },
  {
    name: 'Olive Siciliane',
    description: 'Marinated Sicilian green & black olives.',
    dietary: ['VG', 'GF'],
    image:
      'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=900&q=85',
    price: '£4.50',
  },
  {
    name: 'Panpizza all’Aglio',
    description: 'Oven-baked garlic pizza bread.',
    dietary: ['VG'],
    image:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=85',
    price: '£6.50',
  },
  {
    name: 'Panpizza con Pesto',
    description: 'Oven-baked garlic pizza bread topped with pesto.',
    dietary: ['VG'],
    image:
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85',
    price: '£7.95',
  },
  {
    name: 'Panpizza all’Aglio e Mozzarella',
    description: 'Oven-baked garlic pizza bread with mozzarella.',
    dietary: ['V'],
    image:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=85',
    price: '£9.00',
  },
  {
    name: 'Panpizza Tricolore',
    description:
      'Oven-baked garlic bread with mozzarella, garlic, tomato and pesto sauce.',
    dietary: ['V'],
    image:
      'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=900&q=85',
    price: '£9.95',
  },
  {
    name: 'Marinara',
    description: 'Oven-baked garlic bread with tomato sauce.',
    dietary: ['VG'],
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=85',
    price: '£7.95',
  },
]

const starters = [
  {
    name: 'Zuppa del Giorno',
    description: 'Fresh homemade soup of the day.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85',
    price: '£6.95',
  },
  {
    name: 'Cocktail di Gamberetti',
    description:
      'Peeled prawns topped with our homemade cocktail sauce, served on a bed of mixed leaves.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=900&q=85',
    price: '£9.95',
  },
  {
    name: 'Formaggio Fritto',
    description:
      'Deep-fried breaded goat cheese served with homemade chilli jam on a bed of mixed leaves.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=900&q=85',
    price: '£10.50',
  },
  {
    name: 'Cozze al Vino',
    description: 'Fresh mussels cooked with white wine and parsley.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=85',
    price: '£10.50',
  },
  {
    name: 'Cozze al Pomodoro',
    description:
      'Fresh mussels cooked with garlic, onions, tomato sauce and mixed herbs.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=85',
    price: '£10.50',
  },
  {
    name: 'Fegatini di Pollo',
    description:
      'Pan-fried chicken livers with garlic, rosemary, white wine and balsamic vinegar, served with mixed leaves and garlic bread.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=85',
    price: '£9.95',
  },
  {
    name: 'Búfala e Crudo',
    description:
      'Fresh buffalo mozzarella with Parma ham and cherry tomatoes served on a bed of rocket.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=900&q=85',
    price: '£10.95',
  },
  {
    name: 'Melanzane alla Parmigiana',
    description:
      'Oven-baked layers of pan-fried aubergine with parmesan and mozzarella in fresh tomato sauce.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=85',
    price: '£9.95',
  },
  {
    name: 'Caprese di Bufala',
    description:
      'Fresh buffalo mozzarella and tomatoes, drizzled with olive oil and basil, served on a bed of rocket.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85',
    price: '£10.00',
  },
  {
    name: 'Funghi e Spinaci Gratinati',
    description:
      'Oven-baked mushrooms, spinach, garlic, mixed herbs, béchamel and tomato sauce topped with mozzarella.',
    dietary: ['VG'],
    image:
      'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=900&q=85',
    price: '£10.50',
  },
  {
    name: 'Bruschetta al Pomodoro',
    description:
      'Toasted bread topped with fresh tomatoes, garlic, basil and olive oil served on a bed of mixed leaves.',
    dietary: ['VG'],
    image:
      'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=900&q=85',
    price: '£8.85',
  },
  {
    name: 'Calamari Fritti',
    description: 'Deep-fried squid rings served with homemade fresh tartar sauce.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=85',
    price: '£10.50',
  },
  {
    name: 'Sardine alla Griglia',
    description: 'Grilled fresh sardines drizzled with garlic and olive oil.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=900&q=85',
    price: '£10.50',
  },
  {
    name: 'Caldo Siciliano',
    description: 'Selection of deep-fried traditional Sicilian street food appetisers.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=900&q=85',
    price: '£10.95',
  },
  {
    name: 'Tagliere di Salumi',
    description:
      'Selection of Italian cured meat, marinated olives and Sicilian cheese served with garlic bread.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85',
    price: '£10.95',
  },
]

const pasta = [
  {
    name: 'Lasagna',
    description:
      'Oven-baked traditional layers of pasta with minced beef, parmesan, mozzarella, béchamel and tomato sauce.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=85',
    price: '£14.95',
  },
  {
    name: 'Penne Amatriciana',
    description: 'Pasta with bacon, onions and tomato sauce.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85',
    price: '£13.95',
  },
  {
    name: 'Penne Salsiccia',
    description: 'Pasta with slow-cooked Sicilian sausage in tomato sauce.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=900&q=85',
    price: '£14.50',
  },
  {
    name: 'Spaghetti Carbonara',
    description: 'Pasta with pancetta, smoked bacon, egg, parmesan and cream.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=85',
    price: '£14.50',
  },
  {
    name: 'Spaghetti Bolognese',
    description: 'Pasta with slowly braised minced beef in tomato sauce.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=85',
    price: '£14.50',
  },
  {
    name: 'Penne alla Norma',
    description:
      'Pasta with aubergine, garlic, tomato sauce, topped with Sicilian salted ricotta.',
    dietary: ['V'],
    image:
      'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=900&q=85',
    price: '£13.50',
  },
  {
    name: 'Penne Arrabiata',
    description: 'Pasta with garlic, chilli and tomato sauce.',
    dietary: ['VG'],
    image:
      'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=900&q=85',
    price: '£12.50',
  },
  {
    name: 'Tagliatelle Funghi',
    description: 'Fresh egg pasta with mushrooms, parmesan and cream.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=85',
    price: '£15.95',
  },
  {
    name: 'Tagliatelle Salsiccia e Funghi',
    description:
      'Fresh egg pasta with Sicilian sausage, mushrooms, a touch of tomato, parsley and olive oil.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85',
    price: '£16.95',
  },
  {
    name: 'Spaghetti allo Scoglio',
    description:
      'Pasta with fresh mussels, squid and king prawns, cooked with a touch of tomato sauce, garlic and olive oil.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=85',
    price: '£21.00',
  },
  {
    name: 'Tagliatelle al Gambero',
    description:
      'Fresh egg pasta with a touch of tomato sauce, king prawns, cherry tomatoes, parsley and olive oil.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=900&q=85',
    price: '£21.00',
  },
  {
    name: 'Risotto Mare',
    description: 'Risotto with mussels, squid, prawns and tomato sauce.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=85',
    price: '£21.95',
  },
  {
    name: 'Risotto con Funghi',
    description: 'Risotto with mushrooms, parmesan and cream.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=900&q=85',
    price: '£18.00',
  },
  {
    name: 'Risotto Salsiccia',
    description:
      'Risotto with Sicilian sausage, fennel seeds, smoked mozzarella, parmesan and a touch of cream.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85',
    price: '£20.00',
  },
]

const meat = [
  {
    name: 'Stinco di Agnello Arrosto',
    description: 'Roasted lamb shank with homemade gravy, served with sautéed potatoes.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85',
    price: '£20.50',
  },
  {
    name: 'Agnello alla Griglia',
    description: 'Grilled leg of lamb steak served with sautéed potatoes.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=85',
    price: '£19.95',
  },
  {
    name: 'Cotoletta alla Milanese',
    description: 'Pan-fried breaded veal escalope served with spaghetti in tomato sauce.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85',
    price: '£20.95',
  },
  {
    name: 'Saltimbocca alla Romana',
    description:
      'Pan-fried veal topped with Parma ham and sage in homemade gravy sauce, served with sautéed potatoes.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=900&q=85',
    price: '£20.95',
  },
  {
    name: 'Scaloppine ai Funghi',
    description:
      'Pan-fried veal with mushrooms in truffle oil and cream sauce, served with sautéed potatoes.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=900&q=85',
    price: '£18.95',
  },
  {
    name: 'Scaloppine al Limone',
    description: 'Pan-fried veal with lemon sauce, served with sautéed potatoes.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=85',
    price: '£18.95',
  },
  {
    name: 'Pollo ai Funghi e Spinaci',
    description:
      'Grilled chicken breast with spinach and mushrooms in cream sauce, served with sautéed potatoes.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=85',
    price: '£15.95',
  },
  {
    name: 'Pollo alla Loggia',
    description:
      'Grilled chicken breast with asparagus, peppers and onions, topped with mozzarella in gravy sauce, served with sautéed potatoes.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=900&q=85',
    price: '£17.95',
  },
  {
    name: 'Pollo Panato',
    description: 'Pan-fried breaded chicken breast, served with chips.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=85',
    price: '£14.25',
  },
  {
    name: 'Salsiccia al Sugo',
    description:
      'A stew of Sicilian sausage with fennel seeds, cannellini beans and potatoes in garlic, chilli and tomato sauce.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=900&q=85',
    price: '£17.45',
  },
  {
    name: 'Bistecca alla Griglia',
    description: 'Grilled sirloin steak, served with sautéed potatoes.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85',
    price: '£23.95',
  },
]

const fish = [
  {
    name: 'Filetto di Spigola',
    description:
      'Grilled fillet of sea bass with garlic, white wine, olive oil and cherry tomato sauce, served with sautéed potatoes.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=900&q=85',
    price: '£20.95',
  },
  {
    name: 'Salmone al Cartoccio',
    description:
      'Oven-baked fresh salmon topped with cherry tomatoes, garlic, peppers, onions and black olives, served with sautéed potatoes.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=85',
    price: '£20.95',
  },
  {
    name: 'Gamberoni all’Aglio (6)',
    description:
      'Pan-fried king prawns with white wine, garlic and butter, served with sautéed potatoes.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=900&q=85',
    price: '£20.95',
  },
  {
    name: 'Gamberoni Arrabiata (6)',
    description:
      'Pan-fried king prawns with chilli, garlic and tomato sauce, served with sautéed potatoes.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=85',
    price: '£20.95',
  },
  {
    name: 'Calamari Fritti',
    description:
      'Deep-fried squid rings served with homemade fresh tartar sauce and sautéed potatoes.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=85',
    price: '£19.95',
  },
  {
    name: 'Sardine alla Griglia',
    description:
      'Grilled fresh sardines drizzled with garlic and olive oil, served with sautéed potatoes.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=900&q=85',
    price: '£16.95',
  },
  {
    name: 'Cozze al Vino',
    description:
      'Fresh mussels cooked with white wine and parsley, with a side of sautéed potatoes.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=85',
    price: '£19.50',
  },
  {
    name: 'Cozze al Pomodoro',
    description:
      'Fresh mussels cooked with garlic, onions, tomato sauce and mixed herbs, with a side of sautéed potatoes.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=85',
    price: '£19.50',
  },
]

const pizza = [
  {
    name: 'Margherita',
    description: 'Tomato sauce and mozzarella.',
    dietary: ['V'],
    image:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=85',
    price: '£11.25 / £17.50 / £25.95',
  },
  {
    name: 'Diavola',
    description: 'Tomato sauce, mozzarella and spicy salami.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=85',
    price: '£12.95 / £21.50 / £28.95',
  },
  {
    name: 'Napoli',
    description: 'Tomato sauce, mozzarella, anchovies, capers and olives.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=900&q=85',
    price: '£13.25 / £21.95 / £27.95',
  },
  {
    name: 'Siciliana',
    description:
      'Tomato sauce, buffalo mozzarella and aubergine topped with Sicilian salty ricotta.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=900&q=85',
    price: '£13.50 / £21.95 / £28.95',
  },
  {
    name: 'Prosciutto Rucola',
    description: 'Tomato sauce, mozzarella, rocket, Parma ham and parmesan shavings.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=900&q=85',
    price: '£15.25 / £24.95 / £31.50',
  },
  {
    name: 'Europea',
    description: 'Tomato sauce, mozzarella, frankfurters and chips.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=900&q=85',
    price: '£13.25 / £21.50 / £28.95',
  },
  {
    name: 'Sferracavallo',
    description: 'Tomato sauce, mozzarella, squid, king prawns and mussels.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=85',
    price: '£16.50 / £25.95 / £33.95',
  },
  {
    name: 'Capricciosa',
    description:
      'Tomato sauce, mozzarella, spicy salami, mushrooms, ham, artichokes and olives.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=900&q=85',
    price: '£14.50 / £23.95 / £29.95',
  },
  {
    name: 'Vegetariana',
    description:
      'Tomato sauce, mozzarella, aubergine, zucchini, mushrooms, peppers, artichokes and olives.',
    dietary: ['V'],
    image:
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85',
    price: '£14.50 / £23.95 / £28.95',
  },
  {
    name: 'Salsiccia e Melanzane',
    description: 'Tomato sauce, buffalo mozzarella, Sicilian sausage and aubergine.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85',
    price: '£15.25 / £24.95 / £31.50',
  },
  {
    name: 'Calzone',
    description: 'Folded pizza with tomato sauce, mozzarella, ham and mushrooms.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=85',
    price: '£14.25 / £23.95 / £29.95',
  },
  {
    name: 'Prosciutto Funghi',
    description: 'Tomato sauce, mozzarella, Parma ham and mushrooms.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85',
    price: '£13.50 / £22.00 / £28.95',
  },
  {
    name: 'Bufala e Crudo',
    description: 'Tomato sauce, buffalo mozzarella and Parma ham.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=900&q=85',
    price: '£14.50 / £24.95 / £31.50',
  },
  {
    name: 'Tonno e Cipolla',
    description: 'Tomato sauce, mozzarella, tuna and onions.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=900&q=85',
    price: '£14.25 / £23.95 / £29.95',
  },
  {
    name: 'Al Pollo',
    description: 'Tomato sauce, mozzarella, grilled chicken breast and jalapeños.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=85',
    price: '£15.25 / £24.95 / £31.50',
  },
  {
    name: 'Quattro Formaggi',
    description: 'Mozzarella, Brie, Parmesan and Gorgonzola cheese.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=900&q=85',
    price: '£13.95 / £21.95 / £29.50',
  },
  {
    name: 'Faccia di Vecchia',
    description:
      'Mozzarella, Sicilian olives with stone, cherry tomatoes, anchovies and parmesan cheese.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=900&q=85',
    price: '£14.50 / £23.95 / £29.95',
  },
  {
    name: 'Rustica',
    description:
      'Mozzarella, Sicilian olives with stone, spicy salami, cherry tomatoes and parmesan cheese.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=85',
    price: '£14.25 / £23.95 / £29.95',
  },
]

const mainCourseSalads = [
  {
    name: 'Insalata di Pollo',
    description:
      'A selection of green leaves, grilled chicken breast, crispy bacon, shaved Parmesan and croutons with olive oil.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85',
    price: '£15.95',
  },
  {
    name: 'Insalata Italiana',
    description:
      'Selection of green leaves, rocket, cherry tomatoes, buffalo mozzarella, basil and olive oil.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85',
    price: '£11.95',
  },
]

const sideDishes = [
  {
    name: 'Insalata Mista',
    description:
      'Selection of green leaves, tomatoes, olives, cucumber, carrot, onions and sweet peppers with homemade dressing.',
    dietary: [],
    image:
      'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=900&q=85',
    price: '£5.95',
  },
  {
    name: 'Insalata Pomodoro e Cipolla',
    description:
      'Fresh tomatoes, red onions, Sicilian olives with stones, oregano and olive oil.',
    dietary: ['GF', 'VG'],
    image:
      'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=900&q=85',
    price: '£5.95',
  },
  {
    name: 'Insalata di Rucola',
    description: 'Rocket, tomatoes and parmesan shavings in olive oil.',
    dietary: ['GF'],
    image:
      'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=900&q=85',
    price: '£6.95',
  },
  {
    name: 'Insalata Verde',
    description:
      'Selection of green leaves, cucumber, olives and green peppers in olive oil.',
    dietary: ['GF', 'VG'],
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85',
    price: '£6.95',
  },
  {
    name: 'Vegetali Misti',
    description: 'Selection of steamed vegetables.',
    dietary: ['GF', 'VG'],
    image:
      'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=900&q=85',
    price: '£5.50',
  },
  {
    name: 'Spinaci all’Aglio',
    description: 'Sautéed fresh spinach with garlic and olive oil.',
    dietary: ['GF', 'VG'],
    image:
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85',
    price: '£6.50',
  },
  {
    name: 'Riso, Chips, Patate',
    description: 'Rice, chips or sautéed potatoes.',
    dietary: ['GF', 'VG'],
    image:
      'https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=900&q=85',
    price: '£4.50',
  },
]

const menuSections = [
  { id: 'appetizers-title', label: 'Appetizers' },
  { id: 'starters-title', label: 'Starters' },
  { id: 'pasta-title', label: 'Pasta' },
  { id: 'meat-title', label: 'Meat' },
  { id: 'fish-title', label: 'Fish' },
  { id: 'pizza-title', label: 'Pizza' },
  { id: 'main-course-salad-title', label: 'Salads' },
  { id: 'side-dishes-title', label: 'Sides' },
]

const steakSauces = [
  {
    name: 'Diana',
    description: 'Mushrooms, onions, mustard, brandy and homemade gravy sauce.',
    price: '£4.25',
  },
  {
    name: 'Al Pepe',
    description: 'Peppercorns and homemade gravy sauce.',
    price: '£3.75',
  },
  {
    name: 'Al Gorgonzola',
    description: 'Gorgonzola cheese and cream sauce.',
    dietary: ['GF'],
    price: '£3.75',
  },
]

function MenuItem({ item, isPizza }) {
  const [size, setSize] = useState('Small')
  const { addItem } = useCart()
  const prices = isPizza ? item.price.split('/').map((price) => price.trim()) : [item.price]
  const sizeIndex = ['Small', 'Medium', 'Large'].indexOf(size)
  const selectedPrice = prices[isPizza ? sizeIndex : 0]

  return (
    <li className="menu-item">
      <img alt={item.name} className="menu-item-image" loading="lazy" src={item.image} />
      <div className="menu-item-content">
        <div>
          <h3>
            {item.name}{' '}
            {item.dietary.length > 0 && (
              <span className="dietary-labels">({item.dietary.join(', ')})</span>
            )}
          </h3>
          <p>{item.description}</p>
        </div>
        <div className="menu-item-actions">
          {isPizza && (
            <label className="pizza-size-selector">
              Size
              <select value={size} onChange={(event) => setSize(event.target.value)}>
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
              </select>
            </label>
          )}
          <span className="menu-price">{isPizza ? selectedPrice : item.price}</span>
          <button
            className="menu-add-button"
            type="button"
            onClick={() =>
              addItem({
                image: item.image,
                name: item.name,
                price: selectedPrice,
                size: isPizza ? size : undefined,
              })
            }
          >
            Add to basket
          </button>
        </div>
      </div>
    </li>
  )
}

function MenuCategory({ id, isPizza = false, items, note, subtitle, title }) {
  return (
    <section className="menu-category" aria-labelledby={id}>
      <div className="menu-category-heading">
        <h2 id={id}>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <ul className="menu-items">
        {items.map((item) => <MenuItem key={item.name} isPizza={isPizza} item={item} />)}
      </ul>
      {note && <p className="menu-category-note">{note}</p>}
    </section>
  )
}

function SteakSauces() {
  return (
    <section className="steak-sauces" aria-labelledby="steak-sauces-title">
      <h3 id="steak-sauces-title">Steak sauces</h3>
      <div className="steak-sauce-list">
        {steakSauces.map((sauce) => (
          <article key={sauce.name} className="steak-sauce">
            <h4>
              {sauce.name}{' '}
              {sauce.dietary?.length > 0 && (
                <span className="dietary-labels">({sauce.dietary.join(', ')})</span>
              )}
            </h4>
            <p>{sauce.description}</p>
            <span>{sauce.price}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

function Menu() {
  const [activeSection, setActiveSection] = useState(menuSections[0].id)

  useEffect(() => {
    const sectionHeadings = menuSections
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean)
    const updateActiveSection = () => {
      const scrollOffset = 140
      const currentSection = sectionHeadings.reduce(
        (activeHeading, heading) =>
          heading.getBoundingClientRect().top <= scrollOffset ? heading : activeHeading,
        sectionHeadings[0],
      )

      setActiveSection(currentSection.id)
    }

    updateActiveSection()
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)

    return () => {
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [])

  return (
    <section className="menu-page">
      <div className="menu-heading">
        <p className="section-eyebrow">Our menu</p>
        <h1 className="page-heading">Menu</h1>
        <p className="page-description">
          Italian flavours made with carefully selected ingredients.
        </p>
      </div>
      <nav aria-label="Menu sections" className="menu-section-navigation">
        {menuSections.map((section) => (
          <a
            key={section.id}
            aria-current={activeSection === section.id ? 'location' : undefined}
            className={activeSection === section.id ? 'active' : ''}
            href={`#${section.id}`}
          >
            {section.label}
          </a>
        ))}
      </nav>

      <MenuCategory
        id="appetizers-title"
        items={appetizers}
        subtitle="Appetizers"
        title="Stuzzichini"
      />
      <MenuCategory id="starters-title" items={starters} subtitle="Starters" title="Antipasti" />
      <MenuCategory
        id="pasta-title"
        items={pasta}
        note="Penne and spaghetti pasta are available gluten-free for an additional £2.50."
        subtitle="Pasta"
        title="Pasta"
      />
      <MenuCategory id="meat-title" items={meat} subtitle="Meat" title="Meat" />
      <SteakSauces />
      <MenuCategory id="fish-title" items={fish} subtitle="Fish" title="Pesce" />
      <MenuCategory
        id="pizza-title"
        isPizza
        items={pizza}
        note="Prices are small / medium / large. Small serves 1, medium serves 2 and large serves 3. All small pizzas are available on a gluten-free base for an additional £2.50. Vegan cheese is available from £2.30+. Extras: small £2.50, medium £3.50, large £4.50."
        subtitle="Pizza"
        title="Pizza"
      />
      <MenuCategory
        id="main-course-salad-title"
        items={mainCourseSalads}
        subtitle="Main course salad"
        title="Insalatone"
      />
      <MenuCategory id="side-dishes-title" items={sideDishes} subtitle="Side dishes" title="Contorno" />
      <section className="menu-allergy-notice" aria-labelledby="allergy-title">
        <h2 id="allergy-title">Food allergies</h2>
        <p>Our dishes may contain traces of allergens. Please warn staff of any allergies.</p>
        <dl>
          <div>
            <dt>VG</dt>
            <dd>Vegan</dd>
          </div>
          <div>
            <dt>V</dt>
            <dd>Vegetarian</dd>
          </div>
          <div>
            <dt>GF</dt>
            <dd>Gluten-free</dd>
          </div>
        </dl>
      </section>
    </section>
  )
}

export default Menu
