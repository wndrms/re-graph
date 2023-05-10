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
					const readQuery = 'MATCH (w1:EA)-[]->(w2:EA) WHERE w1.Hacking_Case is null and w2.Hacking_Case is not null return DISTINCT w1.Name, w2.Hacking_Case';
					const readResult = await session.executeRead(tx =>
						tx.run(readQuery)
					);
					const adlist = [];
					readResult.records.forEach(record => {
						if (record.get('w1.Name') !== null && record.get('w2.Hacking_Case') !== null)
							adlist.push({address: record.get('w2.Hacking_Case'), info: record.get('w1.Name')});
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