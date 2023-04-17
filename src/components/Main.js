import driver from './neo4j'
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Main = () => {
	const [addrlist, setaddrlist] = useState([]);
	useEffect(() => {
		(async () => {
			try {
				await setaddresslist(driver);
			} catch (error) {
				console.error(`Something went wrong1: ${error}`);
			} finally {
				await driver.close();
			}
			async function setaddresslist(driver) {
				const session = driver.session({ database: 'neo4j' });
				try {
					const readQuery = 'Match (w:Wallet) RETURN DISTINCT w.hacker';
					const readResult = await session.executeRead(tx =>
						tx.run(readQuery)
					);
					const adlist = [];
					readResult.records.forEach(record => {
						if (record.get('w.hacker') !== null)
							adlist.push(record.get('w.hacker'));
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
	return(
		<div>
			<h1>Hacker Wallet List</h1>
            <div style={{'display': 'flex', 'flexDirection':'column'}}>
                {addrlist.map(a => {
                    return <Link to={`/graph/${a}`} key={a}>{a}</Link>
                })}
            </div>
		</div>
	);
}

export default Main;