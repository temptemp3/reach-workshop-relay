import {loadStdlib} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';

(async () => {
  const stdlib = await loadStdlib();
  const startingBalance = stdlib.parseCurrency(100);

  const alice = await stdlib.newTestAccount(startingBalance);
  const bob = await stdlib.newTestAccount(startingBalance);
  
  const getBalance = async (who) =>
    stdlib.formatCurrency(await stdlib.balanceOf(who), 4)

  const beforeAlice = await getBalance(alice);
  const beforeBob = await getBalance(bob);

  const ctcAlice = alice.deploy(backend);

  let accRelayProvide = null;
  const accRelayP = new Promise((resolve, reject) => {
    accRelayProvide = resolve;
  })

  await Promise.all([
    backend.Alice(ctcAlice, {
      amt: stdlib.parseCurrency(25),
      getRelay: async () => {
        console.log('Alice creates a Relay account.');
        const accRelay = await stdlib.newTestAccount(stdlib.minimumBalance);
        console.log('Alice shares it with Bob outside of the network.');
        accRelayProvide(accRelay);
        return accRelay.networkAccount;
      }
    }),
    (async () => {
      console.log('Bob waits for Alice to give him the information about the Relay');
      const accRelay = await accRelayP
      console.log('Bob deposits some funds into the Relay to use it.');
      await stdlib.transfer(bob, accRelay, stdlib.parseCurrency(1));
      const ctcRelay = accRelay.attach(backend, ctcAlice.getInfo());
      console.log('Bob joins the application as the Relay.');
      return backend.Relay(ctcRelay, {
        getBob: async () => {
          console.log('Bob, acting as the Relay gives his information.');
          return bob.networkAccount;
        }
      });
    })(),
  ]);

  const afterAlice = await getBalance(alice);
  const afterBob = await getBalance(bob);

  console.log(`Alice went from ${beforeAlice} to ${afterAlice}.`);
  console.log(`Bob went from ${beforeBob} to ${afterBob}.`);

})();
