# Hacking Wars - User Manual

## 🎯 Objective
Dominate the network by capturing all enemy nodes. Manage your resources (packets), expand your territory, and defend against the AI.

## 🎮 Controls
-   **Connect Nodes:** Click and drag from one of your nodes (Green) to any other node.
-   **Cut Wires:** Click and drag across existing wires to sever them.
    -   *Note:* You cannot cut enemy wires directly! You must capture the node or defend against them.

## 🕹 Gameplay Mechanics

### 1. Nodes (Servers)
Nodes are the core of your network.
-   **Generation:** Nodes automatically generate **packets** (data units) over time.
-   **Upgrades:** Nodes upgrade automatically as they accumulate packets:
    -   **Level 1:** Base generation rate. Max 1 outgoing connection.
    -   **Level 2 (15+ packets):** Faster generation. Max 2 outgoing connections.
    -   **Level 3 (30+ packets):** Fastest generation. Max 3 outgoing connections.
-   **Capture:** When a packet hits a node:
    -   **Friendly:** Adds to the node's value.
    -   **Enemy/Neutral:** Subtracts from the node's value. If it hits 0, the node is captured.

### 2. Wires (Connections)
Wires transfer packets between nodes.
-   **One-Way:** Standard connections send packets from Source -> Target.
-   **Tug of War:** You can connect back to an enemy node that is attacking you. This creates a bi-directional link where units fight on the wire!
-   **Wire Flipping:** If you connect two of your *own* nodes that are already connected backwards, the wire simply flips direction. This helps you re-route your network without clutter.

### 3. Wire Cutting
-   You can cut any wire by dragging your mouse/finger across it (like Fruit Ninja).
-   **Strategic Cut:** When a node is captured by the enemy, all **outgoing** wires from that node are instantly cut. Incoming wires stay connected, giving you a chance to counter-attack immediately.

### 4. The Enemy (AI)
-   The AI (Red) will expand to neutral nodes and attack you.
-   It plays by the same rules but is aggressive.
-   **Defense:** Don't leave your nodes empty! Keep them stocked with packets to defend against attacks.

## 📱 Mobile Play
-   The game is fully optimized for touchscreens.
-   The game board scales to fit 90% of your screen for easy access.

## 🏆 Winning & Losing
-   **Victory:** Capture all enemy nodes.
-   **Defeat:** Lose all your nodes.
-   **Game Over:** The simulation continues for 5 seconds after the result screen, allowing you to see the final state of the network.
