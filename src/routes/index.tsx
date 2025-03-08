import { createBrowserRouter } from "react-router-dom";
import Welcome from "../pages/Welcome";
import Authors from "../pages/Authors";
import Author from "../pages/AuthorPage";
import Contact from "../pages/Contact";


const routes = createBrowserRouter([
    {
        path: "/",
        children: [
            { index: true, element: <Welcome /> },
            { path: 'authors', element: <Authors /> },
            { path: 'author/:name', element: <Author /> },
            { path: 'contact', element: <Contact /> },
            { path: '/auth/:provider', element: <Welcome /> },
            // { path: "*", element: <NotFound /> }, // Catch-all for unknown routes
        ],
    },
]);

export default routes;
