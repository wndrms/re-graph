import driver from './neo4j'
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import './Main.css';

const Main = () => {
	const [addrlist, setaddrlist] = useState([]);
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
					const readQuery = 'MATCH (n:EA) WHERE n.Address = n.Hacking_Case RETURN n.Name, n.Hacking_Case';
					const readResult = await session.executeRead(tx =>
						tx.run(readQuery)
					);
					const adlist = [];
					readResult.records.forEach(record => {
						if (record.get('n.Name') !== null && record.get('n.Hacking_Case') !== null)
							adlist.push({address: record.get('n.Hacking_Case'), info: record.get('n.Name')});
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
				<table>
					<thead>
						<tr>
							<th>Address</th>
							<th>INFO</th>
						</tr>
					</thead>
					<tbody>
						{addrlist.map((addr) => (
							<tr>
								<td><Link to={`/graph/${addr.address}`}>{addr.address}</Link></td>
								<td>{addr.info}</td>
							</tr>
						))}
					</tbody>
				</table>
            </div>
		</div>
	);
}

export default Main;