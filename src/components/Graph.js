import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import driver from './neo4j'
import DrawGraph from "./DrawGraph";
import axios from "axios";
import DrawBarGraph from "./DrawBarGraph";

const Graph = () => {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [selected, setSelected] = useState(null);
  const [balance, setBalance] = useState();
  const [income, setIncome] = useState();
  const [outgoing, setOutgoing] = useState();
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
        var nodes = [{name: target, layer: 0}]
        var links = []
        try {
          const readQuery = 'MATCH (a:Wallet)-[t:TX]->(b:Wallet) WHERE a.hacker=$name OR b.hacker=$name RETURN a, t, b';
          const readResult = await session.executeRead(tx =>
            tx.run(readQuery, { name: target })
          );
          
          readResult.records.forEach(record => {
            if (nodes.find((node) => node.name === record.get('a').properties.addr) === undefined)
              nodes.push({ name: record.get('a').properties.addr, type: record.get('a').properties.type })
            if (nodes.find((node) => node.name === record.get('b').properties.addr) === undefined)
              nodes.push({ name: record.get('b').properties.addr, type: record.get('b').properties.type })
            const link = links.find((link) => link.source === record.get('a').properties.addr && link.target === record.get('b').properties.addr) 
            if ( link === undefined ){
              links.push({ source: record.get('a').properties.addr, target: record.get('b').properties.addr, value: record.get('t').properties.value});
            } else {
              link.value += record.get('t').properties.value
            }
          });
        } catch (error) {
          console.error(`Something went wrong2: ${error}`);
        } finally {
          await session.close();
        }
        var last_layer = setLayer(nodes, links, target);
        nodes.forEach((node) => {
          if (node.type === 'Contract') 
            node.layer = last_layer - 2;
          else if (node.type === 'Exchange')
            node.layer = last_layer - 1;
        });
        links.forEach((link) => {
          if (link.target === target)
            nodes.find((node) => node.name === link.source).layer = -1;
        })
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
      setBalance(response.data.result);
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
      //const response2 = await axios.post('/loadtx', { addr });
      //setTxlist(response2.data.result);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <div style={{'display':'flex'}}>
          <div style={{'width': '50%'}}>
            <DrawGraph data={data} onClick={handleClick}/>
          </div>
          <div style={{'display':'flex', 'flexDirection':'column', 'width': '50%'}}>
            <div style={{'height':'50%'}}>
              {selected && 
                <>
                  <h2>{selected.name}</h2>
                  <a href={"https://etherscan.io/address/" + selected.name} target="_blank" rel="noreferrer">Etherscan</a>
                  <p>{selected.type}</p>
                  <p>Balance : {balance}</p>
                </>
              }
            </div>
            <div style={{'height':'50%'}}>
              test
              {income && 
                <>
                  <DrawBarGraph title="Income" data={income}/>
                  <DrawBarGraph title="Outgoing" data={outgoing}/>
                </>
              }
              {txlist && 
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
    </div>
  );
}

export default Graph;