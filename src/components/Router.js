import React from "react";
import { BrowserRouter, Routes, Route} from "react-router-dom";
import Main from "./Main";
import Graph from "./Graph";
import SearchBar from "./Search";

const AppRouter = () => {
	return(
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Main />}/>
                <Route path="/graph/:id" element={<Graph />}/>
				<Route path="/search" element={<SearchBar />}/>
			</Routes>
		</BrowserRouter>
	);
}

export default AppRouter;