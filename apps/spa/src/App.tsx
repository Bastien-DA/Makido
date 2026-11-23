import { NavLink, Route, Routes } from 'react-router';

import { Borne } from './pages/Borne';
import { Cuisine } from './pages/Cuisine';
import { Home } from './pages/Home';

export function App() {
  return (
    <>
      <header>
        <nav aria-label="Navigation principale">
          <NavLink to="/" end>
            Accueil
          </NavLink>
          <NavLink to="/borne">Borne</NavLink>
          <NavLink to="/cuisine">Cuisine</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/borne" element={<Borne />} />
          <Route path="/cuisine" element={<Cuisine />} />
          <Route path="*" element={<h1>Page introuvable</h1>} />
        </Routes>
      </main>
    </>
  );
}
