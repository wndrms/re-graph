import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import driver from './neo4j'

const SearchBar = () => {
	const [addrlist, setaddrlist] = useState([]);
    const [query, setQuery] = useState('');
    const [matchAddr, setmatchAddr] = useState([]);
    const [error, seterror] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
		(async () => {
			try {
				await setaddresslist(driver);
			} catch (error) {
				console.error(`Something went wrong1: ${error}`);
			} 
			async function setaddresslist(driver) {
				const session = driver.session({ database: 'neo4j' });
				try {
					const readQuery = 'MATCH (n:EA) WHERE n.Address = n.Hacking_Case RETURN n.Hacking_Case';
					const readResult = await session.executeRead(tx =>
						tx.run(readQuery)
					);
					const adlist = [];
					readResult.records.forEach(record => {
						if (record.get('n.Hacking_Case') !== null)
							adlist.push(record.get('n.Hacking_Case'));
					})
					setaddrlist(adlist);
				} catch (error) {
					console.error(`Something went wrong2: ${error}`);
				} finally {
					await session.close();
				}
			}
		})();
	}, [])

    function handleSubmit(event) {
        event.preventDefault();
        navigate('/graph/' + query);

    }

    function handleInputChange(event) {
        setQuery(event.target.value);
        let tmpArray = [...addrlist];
        tmpArray = tmpArray.filter((addr) => addr.includes(event.target.value));
        if (event.target.value === '') tmpArray=[];
        setmatchAddr(tmpArray);
    }

    return (
        <form onSubmit={handleSubmit} style={{'display': 'flex', 'flexDirection':'column'}}>
            <input type="text" value={query} onChange={handleInputChange}/>
            <ul>
                {matchAddr.map((addr) => (
                    <li onClick={() => setQuery(addr)}><button>{addr}</button></li>
                ))}
            </ul>
            {error && <p>정확한 주소를 입력해주세요</p>}
            <button type="submit">Search</button>
        </form>
    )
}

export default SearchBar;