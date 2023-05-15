import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import driver from './neo4j'
import DrawGraph from "./DrawGraph";
import axios from "axios";
import DrawBarGraph from "./DrawBarGraph";
import './Graph.css';

const Graph = () => {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [selected, setSelected] = useState(null);
  const [balance, setBalance] = useState();
  const [income, setIncome] = useState();
  const [outgoing, setOutgoing] = useState();
  const [menu, setMenu] = useState();
  const [txlist, setTxlist] = useState();
  const target = useParams().id;
  useEffect(() => {
    (async () => {
      try{
        await findNodes(driver, target)
      } catch (error) {
        console.error(`Something went wrong1: ${error}`);
      } 

      async function findNodes(driver, target) {
        const session = driver.session({ database: 'neo4j' });
        var nodes = [{name: target, layer: 0, type: 'Hacker'}]
        var links = []
        var colors = []
        try {
          const readQuery = 'MATCH (a:EA)-[t:TX]->(b:EA) WHERE a.Hacking_Case=$name OR b.Hacking_Case=$name RETURN a, t, b';
          const readResult = await session.executeRead(tx =>
            tx.run(readQuery, { name: target })
          );
          
          readResult.records.forEach(record => {
            if (nodes.find((node) => node.name === record.get('a').properties.Address) === undefined)
              nodes.push({ name: record.get('a').properties.Address, type: record.get('a').properties.Account_Type })
            if (nodes.find((node) => node.name === record.get('b').properties.Address) === undefined)
              nodes.push({ name: record.get('b').properties.Address, type: record.get('b').properties.Account_Type })
            var link
            if (record.get('t').properties.tx_type === undefined){
              link = links.find((link) => link.source === record.get('a').properties.Address && link.target === record.get('b').properties.Address)   
            } else {
              link = links.find((link) => link.source === record.get('a').properties.Address && link.target === record.get('b').properties.Address && link.tx_type == record.get('t').properties.tx_type && link.token_symbol == record.get('t').properties.token_symbol)   
            }
            if ( link === undefined ){
              links.push({ source: record.get('a').properties.Address, target: record.get('b').properties.Address, value: Math.round(record.get('t').properties.value), tx_type: record.get('t').properties.tx_type, token_symbol: record.get('t').properties.token_symbol});
              if ( colors.find((token) => token === record.get('t').properties.token_symbol) === undefined){
                colors[record.get('t').properties.token_symbol] = Math.floor(Math.random()*16777215).toString(16);
              }
            } else {
              link.value += Math.round(record.get('t').properties.value)
            }
          });
        } catch (error) {
          console.error(`Something went wrong2: ${error}`);
        } finally {
          await session.close();
        }
        var last_layer = setLayer(nodes, links, target);
        nodes.forEach((node) => {
          if (node.type === 'Smart Contract') 
            node.layer = last_layer - 2;
          else if (node.type === 'Exchange')
            node.layer = last_layer - 1;
          switch (node.layer) {
            case 0 :
              node.itemStyle = {color: '#fd683b'}
              break
            case 1 :
              node.itemStyle = {color: '#D27652'}
              break
            case 2 :
              node.itemStyle = {color: '#938776'}
              break
            case 3 :
              node.itemStyle = {color: '#4E989C'}
              break
            case 4 :
              node.itemStyle = {color: '#22a3b4'}
              break
            default :
              node.itemStyle = {color: '#000000'}
              return
          }
        });
        links.forEach((link) => {
          if (link.token_symbol !== undefined){
            link.lineStyle = {color: '#' + colors[link.token_symbol]}
          }
          if (link.target === target)
            nodes.find((node) => node.name === link.source).layer = -1;
        })
        console.log(links);
        setData({ nodes, links });
      }
      function setLayer(nodes, links, mainNode) {
        const queue = [mainNode];
        const visited = {[mainNode]: true};
        let depth = 1;
        while(queue.length > 0) {
          const n = queue.length;
          for(let i = 0; i < n; i++) {
            const currNode = queue.shift();
            const neighbors = getNeighbors(currNode, links);
            for (const neighbor of neighbors) {
              if(!visited[neighbor]) {
                const node = nodes.find((node) => node.name === neighbor);
                node.layer = depth;
                visited[neighbor] = true;
                queue.push(neighbor);
              }
            }
          }
          depth++;
        }
        return depth
      }
      function getNeighbors(node, links) {
        const neighbors = [];
        links.forEach((link) => {
          if (link.source === node) {
            neighbors.push(link.target);
          }
        })
        return neighbors
      }
    })();
  }, [target]);

  const handleClick = async (node) => {
    if(node.name !== undefined){
      const addr = node.name;
      const response = await axios.post('/execute', { addr });
      setBalance(response.data.result.toFixed(2));
      setSelected(node);
      var inc = {Hacker: 0, Mixer: 0, Exchange: 0, Defi: 0, Contract: 0, Etc: 0};
      var out = {Hacker: 0, Mixer: 0, Exchange: 0, Defi: 0, Contract: 0, Etc: 0};
      data.links.forEach((link) => {
        if(link.source === addr){
          var t = data.nodes.find((node) => node.name === link.target).type;
          if (t === undefined){
            out.Etc += link.value;
          } else {
            out[t] += link.value;
          }
        } else if (link.target === addr) {
          t = data.nodes.find((node) => node.name === link.source).type;
          if (t === undefined){
            inc.Etc += link.value;
          } else {
            inc[t] += link.value;
          }
        }
      })
      setIncome(inc);
      setOutgoing(out);
      setMenu(1);
      //const response2 = await axios.post('/loadtx', { addr });
      //setTxlist(response2.data.result);
    }
  }

  return (
      <header className="App-header">
        <div style={{'display':'flex'}}>
          <div className="GraphGrid">
            <DrawGraph data={data} onClick={handleClick}/>
          </div>
          <div className="InfoGrid">
            <div className="Outline">
              <div className="InfoHeader">
                <div className="selected">
                  <h3>INFO</h3>
                </div>
                <div>
                  <h3>ANALYSIS</h3>
                </div>
                <div>
                  <h3>PATTERN</h3>
                </div>
              </div>
              <div className="InfoContent">
                {selected && 
                  <>
                    <div className="AddressArea">
                      <p className="address">{selected.name}</p>
                      <a href={"https://etherscan.io/address/" + selected.name} target="_blank" rel="noreferrer">
                        <img src="/img/etherscan-logo-circle.png" alt="Etherscan Logo"/>
                      </a>
                    </div>
                    <div className="InfoBox">
                      <div className="TypeBox">
                        <p>{selected.type}</p>
                      </div>
                      <div>
                        <p className="BalanceTitle">현재 잔고</p> 
                        <p className="BalanceValue">{balance}ETH</p>
                      </div>
                    </div>
                  </>
                }
              </div>
            </div>
            <div style={{'height':'50%'}}>
              <div className="InfoHeader">
                <div className={menu === 1 ? "selected" : ""}>
                  <h3 onClick={() => setMenu(1)}>SOURCE OF ACCOUNT</h3>
                </div>
                <div className={menu === 2 ? "selected" : ""}>
                  <h3 onClick={() => setMenu(2)}>TRANSACTION LIST</h3>
                </div>
                <div className={menu === 3 ? "selected" : ""}>
                  <h3></h3>
                </div>
              </div>
              <div className="InfoContent">
                {(menu === 1 && income) && 
                  <>
                    <DrawBarGraph title="Income" data={income}/>
                    <DrawBarGraph title="Outgoing" data={outgoing}/>
                  </>
                }
              </div>
              {(menu === 2 && txlist) && 
                  txlist.map( tx => {
                    return(
                      <div>
                        <p>{tx.BlockNumber}</p>
                      </div>
                    )
                  })
              }
            </div>
          </div>
        </div>
        
      </header>
  );
}

export default Graph;