import type { NextPage } from "next";
import Nav from "../components/Nav";
import Writing from "../components/Writing";
const Home: NextPage = () => {
  return (
    <div>
      <header>
        <Nav />
        <Writing />
      </header>
    </div>
  );
};

export default Home;
