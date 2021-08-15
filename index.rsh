'reach 0.1';

/*
 * 1. Problem Analysis
 * Who are the principals of the application?
 * 1) Alice, who sends funds
 * 2) Bob, who receives funds
 * Who are the participants of the program?
 * 1) Alice, who initiates the application, and
 * 2) the Relay, which transfers funds to Bob
 * ※ Bob is not a participant
 * What information do they know at the start of the program?
 * 1) Alice knows amt 2) Bob knows nothing
 * What information are they going to discover and use in the program?
 * 1) Alice will disover RA 2) Bob will discover RA secret
 * What funds change ownership during the application and how?
 * 1) Alice creates the Relay acc, while the Relay learns the address of Bob, who will receive teh funds
 * 2) Funds move from Alice to Bob through Relay
 * 2. Data Definition
 * Alice: amt, getRelay
 * Relay: getBob
 * 3. Communication Construction
 * 1) Alice pays amount and says who the Relay is
 * 2) Consensus remembers Relay
 * 3) Relay publish who Bob is
 * 4) Consensus pays Bob
 * 4. Assertion Insertion
 * 5. Interaction Introduction
 * 6. Deployment Decisions
 */
export const main = Reach.App(
  { deployMode: 'firstMsg' },
  [Participant('Alice', {
    amt: UInt,
    getRelay: Fun([], Address)
  }),
  Participant('Relay', { getBob: Fun([], Address) })],
  (Alice, Relay) => {
    Alice.only(() => {
      const [amt, relay] =
        declassify([interact.amt,
        interact.getRelay()])
    });
    // Alice pays amount and says who Relay is
    Alice.publish(amt, relay)
      .pay(amt);
    // Consensus remembers Relay
    Relay.set(relay);
    commit();
    // Relay publishes Bob 
    Relay.only(() => {
      const bob = declassify(interact.getBob())
    });
    Relay.publish(bob);
    // Consensus pays Bob
    transfer(amt).to(bob)
    commit();

    exit();
  });
