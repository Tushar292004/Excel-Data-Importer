import { Link } from "react-router-dom";
const Header = () => {
    return (
        <div className=" p-5 border-b-2  py-6">
            <div className="container mx-auto  flex justify-between items-center">
                <Link className=" text-2xl font-bold tracking-tight" to={"/"}>EXCEL-MANAGER</Link>
            </div>
        </div>
    );
}

export default Header;