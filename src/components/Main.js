import React from "react";
import { Link } from "react-router-dom";

const Main = () => {
	const accountlist = [
		'0x098b716b8aaf21512996dc57eb0615e2383e2f96',
        '0xb66cd966670d962c227b3eaba30a872dbfb995db',
	];
	return(
		<div>
			<h1>Hacker Wallet List</h1>
            <div style={{'display': 'flex', 'flexDirection':'column'}}>
                {accountlist.map(a => {
                    return <Link to={`/graph/${a}`}>{a}</Link>
                })}
            </div>
		</div>
	);
}

export default Main;