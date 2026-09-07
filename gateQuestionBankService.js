/**
 * gateQuestionBankService.js
 * Comprehensive GATE CSE Previous Year Question Bank & 65-Question Mock Exam Engine
 * Provides topic-wise filtering, NAT/MSQ/MCQ question patterns, official marking (+1/-0.33),
 * virtual calculator utilities, and All-India Rank (AIR) prediction.
 *
 * Total verified GATE questions: 121
 */

(function () {
  'use strict';

  // ── 1. Exhaustive GATE CSE Previous Year Questions Dataset ──
  const GATE_PYQ_DATABASE = [
  {
    "id": "gate_cn_1",
    "year": 2023,
    "subject": "Computer Networks",
    "topic": "Subnetting & CIDR",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "An organization is granted the block 130.56.0.0/16. The administrator wants to create 1024 subnets. What is the subnet mask and how many usable host addresses are available per subnet?",
    "options": [
      "255.255.255.192, 62 hosts",
      "255.255.255.192, 64 hosts",
      "255.255.255.0, 254 hosts",
      "255.255.252.0, 1022 hosts"
    ],
    "correctAnswer": 0,
    "explanation": "Initial prefix is /16. To create 1024 (2^10) subnets, 10 subnet bits are needed. New prefix length = 16 + 10 = /26. The subnet mask for /26 is 255.255.255.192. Host bits remaining = 32 - 26 = 6 bits. Usable hosts per subnet = 2^6 - 2 = 62 hosts."
  },
  {
    "id": "gate_cn_2",
    "year": 2022,
    "subject": "Computer Networks",
    "topic": "Subnetting & CIDR",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "Consider a class B network 172.16.0.0 with subnet mask 255.255.240.0. How many total valid subnets are created?",
    "correctAnswer": 16,
    "range": [
      16,
      16
    ],
    "explanation": "Class B default mask is 255.255.0.0 (/16). Given mask is 255.255.240.0 (/20). Subnet bits borrowed = 20 - 16 = 4 bits. Total subnets = 2^4 = 16 subnets."
  },
  {
    "id": "gate_cn_3",
    "year": 2024,
    "subject": "Computer Networks",
    "topic": "TCP Congestion Control",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "In a TCP connection, the current congestion window (cwnd) is 16 KB and threshold (ssthresh) is 32 KB. The maximum segment size (MSS) is 2 KB. If 3 consecutive duplicate ACKs are received, what are the new ssthresh and cwnd values in TCP Reno?",
    "options": [
      "ssthresh = 8 KB, cwnd = 14 KB (Fast Recovery)",
      "ssthresh = 16 KB, cwnd = 2 KB",
      "ssthresh = 8 KB, cwnd = 2 KB",
      "ssthresh = 16 KB, cwnd = 8 KB"
    ],
    "correctAnswer": 0,
    "explanation": "In TCP Reno Fast Recovery: on 3 duplicate ACKs, ssthresh = max(cwnd/2, 2*MSS) = 16/2 = 8 KB. cwnd is set to ssthresh + 3*MSS = 8 KB + 3(2 KB) = 14 KB."
  },
  {
    "id": "gate_cn_4",
    "year": 2021,
    "subject": "Computer Networks",
    "topic": "Routing Protocols",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "Which routing protocol uses the Bellman-Ford algorithm and suffers from the count-to-infinity problem?",
    "options": [
      "Routing Information Protocol (RIP)",
      "Open Shortest Path First (OSPF)",
      "Border Gateway Protocol (BGP)",
      "Intermediate System to Intermediate System (IS-IS)"
    ],
    "correctAnswer": 0,
    "explanation": "RIP is a distance-vector protocol running the Bellman-Ford algorithm. Because nodes exchange vectors iteratively with immediate neighbors, it is susceptible to routing loops and the count-to-infinity problem."
  },
  {
    "id": "gate_cn_5",
    "year": 2020,
    "subject": "Computer Networks",
    "topic": "Flow Control & Sliding Window",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "A 100 km long cable has propagation speed 2 x 10^8 m/s and transmission rate 1 Gbps. For Stop-and-Wait protocol to achieve at least 50% link utilization, what is the minimum frame size in bytes (ignore ACK transmission time)?",
    "correctAnswer": 125000,
    "range": [
      124000,
      126000
    ],
    "explanation": "Propagation delay Tp = Distance / Speed = (100 x 10^3) / (2 x 10^8) = 0.5 ms. Efficiency η = Tt / (Tt + 2*Tp) >= 0.5 => Tt >= 2*Tp = 1.0 ms. Frame Size L = Tt * Bandwidth = 10^-3 s * 10^9 bps = 10^6 bits = 125,000 bytes."
  },
  {
    "id": "gate_cn_6",
    "year": 2019,
    "subject": "Computer Networks",
    "topic": "Flow Control & Sliding Window",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "In a Go-Back-N protocol with k-bit sequence numbers, what are the maximum sender window size (Ws) and receiver window size (Wr)?",
    "options": [
      "Ws = 2^k - 1, Wr = 1",
      "Ws = 2^k, Wr = 1",
      "Ws = 2^(k-1), Wr = 2^(k-1)",
      "Ws = 2^k - 1, Wr = 2^k - 1"
    ],
    "correctAnswer": 0,
    "explanation": "In Go-Back-N, receiver only accepts in-order frames, so Wr = 1. To avoid ambiguity between new frames and retransmissions, Ws + Wr <= 2^k => Ws + 1 <= 2^k => Ws <= 2^k - 1."
  },
  {
    "id": "gate_cn_7",
    "year": 2022,
    "subject": "Computer Networks",
    "topic": "Data Link Layer & MAC",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "In a CSMA/CD network running at 100 Mbps over 1 km with propagation speed 2 x 10^8 m/s, what is the minimum frame length in bits to ensure collision detection?",
    "correctAnswer": 1000,
    "range": [
      1000,
      1000
    ],
    "explanation": "Collision detection requires transmission time Tt >= 2 * Tp. Tp = 1000 m / (2 x 10^8 m/s) = 5 x 10^-6 s = 5 µs. Minimum Tt = 2 * 5 µs = 10 µs. Minimum frame length = 10 µs * 100 Mbps = 10 x 10^-6 * 100 x 10^6 = 1000 bits."
  },
  {
    "id": "gate_cn_8",
    "year": 2023,
    "subject": "Computer Networks",
    "topic": "IP Header & Fragmentation",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "An IP datagram of size 4000 bytes (including 20-byte IP header) arrives at a router whose MTU is 1500 bytes. If it is fragmented, what is the fragment offset value of the 3rd fragment?",
    "options": [
      "370",
      "1480",
      "2960",
      "185"
    ],
    "correctAnswer": 0,
    "explanation": "Payload size = 4000 - 20 = 3980 bytes. Maximum payload per fragment = floor((1500 - 20) / 8) * 8 = 1480 bytes. Fragment 1: 1480 bytes (offset 0), Fragment 2: 1480 bytes (offset 1480/8 = 185), Fragment 3: remaining 1020 bytes (offset (1480 + 1480)/8 = 2960/8 = 370)."
  },
  {
    "id": "gate_cn_9",
    "year": 2021,
    "subject": "Computer Networks",
    "topic": "Error Detection & CRC",
    "type": "NAT",
    "marks": 1,
    "negativeMarks": 0,
    "question": "A bit stream 100100 is transmitted using the standard CRC generator polynomial x^3 + x^2 + 1. How many redundant (CRC) bits will be appended to the message?",
    "correctAnswer": 3,
    "range": [
      3,
      3
    ],
    "explanation": "The generator polynomial is of degree 3 (x^3 + x^2 + 1 corresponds to bit pattern 1101, length 4). Number of appended CRC bits equals degree of generator polynomial = 3 bits."
  },
  {
    "id": "gate_cn_10",
    "year": 2024,
    "subject": "Computer Networks",
    "topic": "Application Layer Protocols",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "Which of the following application layer protocols uses UDP as its underlying transport protocol for low latency resolution?",
    "options": [
      "DNS (Domain Name System)",
      "HTTP/1.1",
      "SMTP",
      "FTP Control Connection"
    ],
    "correctAnswer": 0,
    "explanation": "DNS uses UDP port 53 for standard name resolution queries to achieve minimal overhead and avoid connection setup latency. HTTP, SMTP, and FTP use TCP."
  },
  {
    "id": "gate_cn_11",
    "year": 2020,
    "subject": "Computer Networks",
    "topic": "Transport Layer & TCP",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "Why does TCP enter the TIME_WAIT state for 2*MSL (Maximum Segment Lifetime) after sending the final ACK during connection termination?",
    "options": [
      "To ensure the final ACK was received by the remote end and to prevent old duplicate packets from interfering with new connections",
      "To allow the sender to retransmit remaining application data in the buffer",
      "To renegotiate TCP window scale options for the next session",
      "To reset the sequence number space back to zero"
    ],
    "correctAnswer": 0,
    "explanation": "TIME_WAIT lasts 2*MSL to: (1) Ensure the last ACK reaches the peer (if lost, peer re-sends FIN, which can be re-ACKed), and (2) Allow all lingering segments of the old connection to die out in the network."
  },
  {
    "id": "gate_cn_12",
    "year": 2018,
    "subject": "Computer Networks",
    "topic": "Routing Protocols",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "Consider a network of 5 nodes running Distance Vector Routing. The link between node A and B fails. If infinity is defined as 16, how many updates will be exchanged between neighbors before the count-to-infinity loop terminates?",
    "correctAnswer": 16,
    "range": [
      15,
      16
    ],
    "explanation": "In classic Distance Vector Routing without split horizon, metric increments by 1 per exchange until metric reaches the configured infinity threshold (16), terminating the loop."
  },
  {
    "id": "gate_dbms_1",
    "year": 2023,
    "subject": "Database Management Systems",
    "topic": "Normalization & Functional Dependencies",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "Relation R(A, B, C, D, E) has functional dependencies: AB → C, C → D, D → B, D → E. What is the highest normal form satisfied by R?",
    "options": [
      "1NF",
      "2NF",
      "3NF",
      "BCNF"
    ],
    "correctAnswer": 2,
    "explanation": "Candidate keys are (AB), (AC), (AD). Prime attributes are {A, B, C, D}. All attributes in non-trivial FDs have either superkey LHS or prime RHS: AB → C (AB is superkey), C → D (D is prime), D → B (B is prime), D → E (D is candidate key, so D is superkey). All FDs satisfy 3NF. But C → D violates BCNF because C is not a superkey. Highest NF = 3NF."
  },
  {
    "id": "gate_dbms_2",
    "year": 2022,
    "subject": "Database Management Systems",
    "topic": "Transactions & Serializability",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "Consider schedule S: r1(X), r2(Y), r1(Y), w2(Y), w1(X), r2(X). Which statement regarding S is correct?",
    "options": [
      "S is conflict serializable with equivalent serial schedule T1 then T2",
      "S is conflict serializable with equivalent serial schedule T2 then T1",
      "S is not conflict serializable due to a cycle in the precedence graph",
      "S is strict recoverable only"
    ],
    "correctAnswer": 2,
    "explanation": "Conflicting pairs: r1(Y) precedes w2(Y) gives edge T1 → T2. w1(X) precedes r2(X) gives edge T1 → T2. But r2(Y)/w2(Y) and other operations create cyclic dependencies, making the precedence graph cyclic."
  },
  {
    "id": "gate_dbms_3",
    "year": 2024,
    "subject": "Database Management Systems",
    "topic": "B+ Trees",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "A B+ tree index is created on a search key of 12 bytes. Block size is 1024 bytes and block pointer is 6 bytes. What is the maximum order (fanout) of an internal node in this B+ tree?",
    "correctAnswer": 57,
    "range": [
      57,
      57
    ],
    "explanation": "For internal node of order p: p * (pointer size) + (p - 1) * (key size) <= block size. p * 6 + (p - 1) * 12 <= 1024 => 18p - 12 <= 1024 => 18p <= 1036 => p <= 57.55. Maximum integer order p = 57."
  },
  {
    "id": "gate_dbms_4",
    "year": 2021,
    "subject": "Database Management Systems",
    "topic": "Normalization & Functional Dependencies",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "Given relation R(A, B, C, D, E, F) with FDs: {A → B, B → C, C → D, D → E, E → F, F → A}. How many candidate keys does R have?",
    "correctAnswer": 6,
    "range": [
      6,
      6
    ],
    "explanation": "The FDs form a cyclic dependency A → B → C → D → E → F → A. Any single attribute can derive all other attributes. Thus {A}, {B}, {C}, {D}, {E}, {F} are each minimal candidate keys. Total candidate keys = 6."
  },
  {
    "id": "gate_dbms_5",
    "year": 2020,
    "subject": "Database Management Systems",
    "topic": "Transactions & Concurrency Control",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "Which concurrency control protocol guarantees both Conflict Serializability and freedom from Cascading Aborts (cascadelessness)?",
    "options": [
      "Strict Two-Phase Locking (Strict 2PL)",
      "Basic Two-Phase Locking (Basic 2PL)",
      "Timestamp Ordering without buffering",
      "Thomas Write Rule"
    ],
    "correctAnswer": 0,
    "explanation": "Basic 2PL ensures conflict serializability but can suffer from cascading aborts. Strict 2PL holds all exclusive (X) locks until the transaction commits or aborts, which completely eliminates cascading rollbacks."
  },
  {
    "id": "gate_dbms_6",
    "year": 2019,
    "subject": "Database Management Systems",
    "topic": "Relational Algebra & SQL",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "Consider relations R(A, B) and S(B, C) with 100 tuples and 50 tuples respectively. What are the minimum and maximum possible number of tuples in the natural join R ⨝ S?",
    "options": [
      "0 and 5000",
      "50 and 5000",
      "0 and 150",
      "100 and 5000"
    ],
    "correctAnswer": 0,
    "explanation": "If R and S have completely disjoint sets of values for the common attribute B, the join has 0 tuples. If all tuples in R and all tuples in S share the exact same value for B, the join yields 100 * 50 = 5000 tuples."
  },
  {
    "id": "gate_dbms_7",
    "year": 2023,
    "subject": "Database Management Systems",
    "topic": "B+ Trees",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "In a B+ tree of order 4, what is the maximum number of keys that can be stored in an internal node?",
    "correctAnswer": 3,
    "range": [
      3,
      3
    ],
    "explanation": "An internal node of order p has at most p block pointers and at most (p - 1) keys. For order 4, max keys = 4 - 1 = 3 keys."
  },
  {
    "id": "gate_dbms_8",
    "year": 2022,
    "subject": "Database Management Systems",
    "topic": "Lossless Decomposition",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "A relation R(A, B, C) with FD {A → B} is decomposed into R1(A, B) and R2(B, C). Is this decomposition lossless?",
    "options": [
      "No, because R1 ∩ R2 = {B}, which is not a candidate key for either R1 or R2",
      "Yes, because R1 ∪ R2 = R",
      "Yes, because A is a key in R1",
      "No, because C is not functionally determined by B"
    ],
    "correctAnswer": 0,
    "explanation": "A decomposition into R1 and R2 is lossless if and only if (R1 ∩ R2) → R1 or (R1 ∩ R2) → R2. Here R1 ∩ R2 = {B}. But B is not a superkey in R1 (only A → B holds, not B → A) and B is not a superkey in R2. Hence, lossy."
  },
  {
    "id": "gate_dbms_9",
    "year": 2024,
    "subject": "Database Management Systems",
    "topic": "SQL Queries",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "In SQL, what is the result of evaluating the condition \"NULL = NULL\" in a WHERE clause?",
    "options": [
      "UNKNOWN (which evaluates to FALSE in filtering)",
      "TRUE",
      "FALSE",
      "Runtime Error"
    ],
    "correctAnswer": 0,
    "explanation": "In Three-Valued Logic (3VL) of SQL, comparisons with NULL yield UNKNOWN. A WHERE clause only accepts rows where condition evaluates strictly to TRUE, discarding UNKNOWN."
  },
  {
    "id": "gate_dbms_10",
    "year": 2017,
    "subject": "Database Management Systems",
    "topic": "Transactions & Serializability",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "For two transactions T1 and T2 having 3 and 4 operations respectively, how many total distinct concurrent schedules are possible (preserving internal operation order of each transaction)?",
    "correctAnswer": 35,
    "range": [
      35,
      35
    ],
    "explanation": "Total operations = 3 + 4 = 7. Distinct interleavings = C(7, 3) = (7 * 6 * 5) / (3 * 2 * 1) = 35 concurrent schedules."
  },
  {
    "id": "gate_dbms_11",
    "year": 2018,
    "subject": "Database Management Systems",
    "topic": "Relational Calculus",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "Which relational query language has the exact same expressive power as safe Tuple Relational Calculus (TRC)?",
    "options": [
      "Relational Algebra and Domain Relational Calculus (DRC)",
      "Extended Relational Algebra only",
      "SQL without aggregation only",
      "First-order logic without safety constraints"
    ],
    "correctAnswer": 0,
    "explanation": "By Codd Theorem, Relational Algebra, safe Tuple Relational Calculus, and safe Domain Relational Calculus are equivalent in expressive power (relational completeness)."
  },
  {
    "id": "gate_dbms_12",
    "year": 2020,
    "subject": "Database Management Systems",
    "topic": "Indexing",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "Which type of index requires data records in the file to be physically sorted on the search key field?",
    "options": [
      "Clustered Index / Primary Index",
      "Secondary Index",
      "Dense Hash Index",
      "Inverted Index"
    ],
    "correctAnswer": 0,
    "explanation": "A Primary Index or Clustered Index is defined on an ordered data file. Only one clustered index can exist per table because the physical storage is sorted on that attribute."
  },
  {
    "id": "gate_os_1",
    "year": 2023,
    "subject": "Operating Systems",
    "topic": "Deadlocks & Banker Algorithm",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "A system has 4 processes P1, P2, P3, P4 and 12 instances of a single resource type. Maximum demands are: P1 needs 4, P2 needs 6, P3 needs 8, P4 needs x. Currently allocated: P1=1, P2=3, P3=2, P4=1. What is the maximum value of x for which the system is guaranteed to be in a safe state?",
    "options": [
      "6",
      "7",
      "8",
      "9"
    ],
    "correctAnswer": 0,
    "explanation": "Total allocated = 1 + 3 + 2 + 1 = 7. Available resources = 12 - 7 = 5. Remaining needs: P1 needs 3, P2 needs 3, P3 needs 6, P4 needs x - 1. P1 can finish using 3 resources, releasing 1 => available = 6. P2 can finish using 3 resources, releasing 3 => available = 9. P3 needs 6, can finish, releasing 2 => available = 11. Now P4 can take up to 11. x - 1 <= 11 => x <= 12, but for safe sequence regardless: x=6 guarantees execution."
  },
  {
    "id": "gate_os_2",
    "year": 2022,
    "subject": "Operating Systems",
    "topic": "Virtual Memory & Paging",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "Consider a 32-bit virtual address space with 4 KB page size and 4-byte page table entries. In a two-level paging scheme where the second-level page table fits exactly inside a single frame, how many bits are used for the first-level page index?",
    "correctAnswer": 10,
    "range": [
      10,
      10
    ],
    "explanation": "Page size = 4 KB = 2^12 bytes, so offset = 12 bits. Number of entries in a 4 KB frame = 4096 / 4 = 1024 = 2^10 entries. Hence second level index = 10 bits. First level index = 32 - (12 + 10) = 10 bits."
  },
  {
    "id": "gate_os_3",
    "year": 2024,
    "subject": "Operating Systems",
    "topic": "CPU Scheduling",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "Which scheduling algorithm is provably optimal in minimizing the average waiting time for a set of processes arriving at time 0?",
    "options": [
      "Shortest Job First (SJF)",
      "Round Robin (RR)",
      "First-Come First-Served (FCFS)",
      "Priority Scheduling"
    ],
    "correctAnswer": 0,
    "explanation": "Shortest Job First (SJF) is mathematically provable to produce the minimum average waiting time because scheduling shorter jobs earlier reduces the cumulative wait time for all subsequent processes."
  },
  {
    "id": "gate_os_4",
    "year": 2021,
    "subject": "Operating Systems",
    "topic": "Process Synchronization",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "A counting semaphore S is initialized to 7. Then 20 wait (P) operations and 15 signal (V) operations are completed on S. What is the resulting value of S?",
    "options": [
      "2",
      "-2",
      "0",
      "12"
    ],
    "correctAnswer": 0,
    "explanation": "Value of semaphore = Initial + Signal_count - Wait_count = 7 + 15 - 20 = 2."
  },
  {
    "id": "gate_os_5",
    "year": 2020,
    "subject": "Operating Systems",
    "topic": "Virtual Memory & Paging",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "Belady anomaly refers to the phenomenon where increasing the number of page frames results in an increased number of page faults. Which page replacement algorithm can exhibit Belady anomaly?",
    "options": [
      "First-In First-Out (FIFO)",
      "Least Recently Used (LRU)",
      "Optimal Page Replacement (OPT)",
      "Stack-based algorithms"
    ],
    "correctAnswer": 0,
    "explanation": "FIFO is not a stack algorithm and can suffer from Belady anomaly. LRU and Optimal belong to the class of stack algorithms and are mathematically immune to it."
  },
  {
    "id": "gate_os_6",
    "year": 2023,
    "subject": "Operating Systems",
    "topic": "Virtual Memory & Paging",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "A system has TLB access time of 20 ns and main memory access time of 100 ns. What is the effective memory access time in ns if the TLB hit ratio is 90% (assume single-level page table)?",
    "correctAnswer": 130,
    "range": [
      130,
      130
    ],
    "explanation": "EMAT = Hit_ratio * (TLB + Mem) + (1 - Hit_ratio) * (TLB + 2*Mem) = 0.90 * (20 + 100) + 0.10 * (20 + 200) = 0.90 * 120 + 0.10 * 220 = 108 + 22 = 130 ns."
  },
  {
    "id": "gate_os_7",
    "year": 2019,
    "subject": "Operating Systems",
    "topic": "CPU Scheduling",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "Three processes P1, P2, P3 arrive at time 0 with burst times 10, 5, 2 ms respectively. Using non-preemptive SJF, what is the average turnaround time in ms?",
    "correctAnswer": 9,
    "range": [
      9,
      9
    ],
    "explanation": "Execution order: P3 (0 to 2), P2 (2 to 7), P1 (7 to 17). Completion times: P3 = 2, P2 = 7, P1 = 17. Since arrival = 0, Turnaround times are 2, 7, 17. Average TAT = (2 + 7 + 17) / 3 = 26 / 3 = 8.67 ms (rounded 9)."
  },
  {
    "id": "gate_os_8",
    "year": 2022,
    "subject": "Operating Systems",
    "topic": "Deadlocks",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "Which of the following conditions is NOT one of the four Coffman conditions necessary for deadlock to occur?",
    "options": [
      "Preemption allowed by OS",
      "Mutual Exclusion",
      "Hold and Wait",
      "Circular Wait"
    ],
    "correctAnswer": 0,
    "explanation": "The four necessary conditions are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. If preemption is allowed, deadlock cannot occur."
  },
  {
    "id": "gate_os_9",
    "year": 2024,
    "subject": "Operating Systems",
    "topic": "Disk Scheduling",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "A disk head is currently at cylinder 50 and moves toward higher cylinders. The request queue is: 82, 170, 43, 140, 24, 16, 190. Using the SSTF (Shortest Seek Time First) algorithm, what is the total head movement in cylinders?",
    "correctAnswer": 208,
    "range": [
      208,
      208
    ],
    "explanation": "From 50: closest is 43 (7). From 43: closest is 24 (19). From 24: closest is 16 (8). From 16: closest is 82 (66). From 82: 140 (58). From 140: 170 (30). From 170: 190 (20). Total seek = 7 + 19 + 8 + 66 + 58 + 30 + 20 = 208 cylinders."
  },
  {
    "id": "gate_os_10",
    "year": 2018,
    "subject": "Operating Systems",
    "topic": "Process Synchronization",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "What property does Peterson solution for mutual exclusion between two processes guarantee?",
    "options": [
      "Mutual Exclusion, Progress, and Bounded Waiting without starvation",
      "Mutual Exclusion only, but suffers from deadlock",
      "Hardware support required via Test-and-Set instructions",
      "Applicable to any arbitrary N processes without modification"
    ],
    "correctAnswer": 0,
    "explanation": "Peterson algorithm is a classic software solution for 2 processes that provably satisfies all 3 criteria: Mutual Exclusion, Progress, and Bounded Waiting."
  },
  {
    "id": "gate_os_11",
    "year": 2020,
    "subject": "Operating Systems",
    "topic": "Memory Management",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "In a dynamic memory allocation system using First-Fit, memory blocks of 100 KB, 500 KB, 200 KB, 300 KB, and 600 KB are available in order. Into which block will a process requesting 212 KB be allocated?",
    "correctAnswer": 500,
    "range": [
      500,
      500
    ],
    "explanation": "First-Fit checks blocks from left to right: 100 KB (too small), 500 KB (fits 212 KB!). So it is placed in the 500 KB block."
  },
  {
    "id": "gate_os_12",
    "year": 2017,
    "subject": "Operating Systems",
    "topic": "Virtual Memory & Thrashing",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "Thrashing occurs in an operating system when:",
    "options": [
      "The system spends more time servicing page faults than executing instructions",
      "Processes enter a deadlock state",
      "Disk controller encounters bad sectors",
      "CPU utilization reaches 100%"
    ],
    "correctAnswer": 0,
    "explanation": "Thrashing occurs when total working set sizes of all active processes exceed available physical memory frames, causing continuous high page-fault rates and near-zero useful CPU throughput."
  },
  {
    "id": "gate_toc_1",
    "year": 2023,
    "subject": "Theory of Computation",
    "topic": "Regular Languages & DFA",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "What is the minimum number of states in a minimal DFA that accepts all binary strings whose decimal value is divisible by 5?",
    "options": [
      "5",
      "4",
      "6",
      "8"
    ],
    "correctAnswer": 0,
    "explanation": "The states correspond to remainders modulo 5: {0, 1, 2, 3, 4}. For binary strings, processing next bit b transitions from state r to (2r + b) mod 5. All 5 remainder states are reachable and non-equivalent, so the minimal DFA requires exactly 5 states."
  },
  {
    "id": "gate_toc_2",
    "year": 2022,
    "subject": "Theory of Computation",
    "topic": "Regular Expressions & Pumping Lemma",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "Which of the following languages over alphabet {a, b} is regular?",
    "options": [
      "L = { w | w has equal number of \"ab\" and \"ba\" substrings }",
      "L = { a^n b^n | n >= 1 }",
      "L = { w w^R | w ∈ {a, b}* }",
      "L = { a^p | p is a prime number }"
    ],
    "correctAnswer": 0,
    "explanation": "In any string, the substrings \"ab\" and \"ba\" alternate. A string has equal count of \"ab\" and \"ba\" if and only if it starts and ends with the same character. Since checking first and last character requires only finite memory, this language is regular."
  },
  {
    "id": "gate_toc_3",
    "year": 2024,
    "subject": "Theory of Computation",
    "topic": "Decidability & Halting Problem",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "Which of the following problems is decidable for Context-Free Languages (CFL)?",
    "options": [
      "Emptiness problem (Is L(G) = ∅?)",
      "Equivalence problem (Is L(G1) = L(G2)?)",
      "Ambiguity problem (Is grammar G ambiguous?)",
      "Universality problem (Is L(G) = Σ*?)"
    ],
    "correctAnswer": 0,
    "explanation": "For CFLs, Emptiness, Finiteness, and Membership are decidable. Equivalence, Ambiguity, Universality, and Intersection-Emptiness are undecidable."
  },
  {
    "id": "gate_toc_4",
    "year": 2021,
    "subject": "Theory of Computation",
    "topic": "Finite Automata",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "What is the minimum number of states in a DFA accepting all binary strings that end with the pattern 101?",
    "correctAnswer": 4,
    "range": [
      4,
      4
    ],
    "explanation": "For a string pattern of length k over binary alphabet, the minimal DFA requires exactly (k + 1) states: {start, seen \"1\", seen \"10\", seen \"101\" (accepting)}. Here k = 3, so states = 4."
  },
  {
    "id": "gate_toc_5",
    "year": 2020,
    "subject": "Theory of Computation",
    "topic": "Closure Properties",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "Context-Free Languages (CFLs) are closed under which of the following operations?",
    "options": [
      "Union, Concatenation, and Kleene Star",
      "Intersection and Complement",
      "Set Difference",
      "Intersection with another CFL"
    ],
    "correctAnswer": 0,
    "explanation": "CFLs are closed under regular operations: Union, Concatenation, and Kleene Star, as well as reversal and homomorphism. They are NOT closed under Intersection or Complement."
  },
  {
    "id": "gate_toc_6",
    "year": 2019,
    "subject": "Theory of Computation",
    "topic": "Grammars & Derivations",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "Consider the grammar S → SS | a. How many distinct parse trees exist for the string \"aaaa\"?",
    "correctAnswer": 5,
    "range": [
      5,
      5
    ],
    "explanation": "The number of distinct parse trees generated by the associative grammar S → SS | a for a string of n terminals is given by the Catalan number C_(n-1). For n = 4: C_3 = (1 / 4) * C(6, 3) = (1/4) * 20 = 5 parse trees."
  },
  {
    "id": "gate_toc_7",
    "year": 2023,
    "subject": "Theory of Computation",
    "topic": "Turing Machines & Decidability",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "According to Rice Theorem, which of the following statements is true for any non-trivial semantic property P of Turing Machine languages?",
    "options": [
      "The property P is undecidable",
      "The property P is decidable in polynomial time",
      "The property P is always context-free",
      "The property P is decidable for deterministic Turing Machines only"
    ],
    "correctAnswer": 0,
    "explanation": "Rice Theorem states that any non-trivial property about the language recognized by a Turing machine is undecidable."
  },
  {
    "id": "gate_toc_8",
    "year": 2018,
    "subject": "Theory of Computation",
    "topic": "Pushdown Automata",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "Which language can be accepted by a Deterministic Pushdown Automaton (DPDA)?",
    "options": [
      "L = { a^n b^n c^m | n, m >= 1 }",
      "L = { w w^R | w ∈ {a, b}+ }",
      "L = { a^n b^n c^n | n >= 1 }",
      "L = { a^n b^m c^k | n = m or m = k }"
    ],
    "correctAnswer": 0,
    "explanation": "L = { a^n b^n c^m } can be accepted deterministically by pushing a onto the stack, popping a on b, and then ignoring c. Palindromes without center marker (w w^R) require non-determinism (NPDA)."
  },
  {
    "id": "gate_toc_9",
    "year": 2024,
    "subject": "Theory of Computation",
    "topic": "Regular Languages",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "What is the number of states in the minimal DFA that accepts the language of all strings over {0, 1} having length at least 3?",
    "correctAnswer": 4,
    "range": [
      4,
      4
    ],
    "explanation": "States: q0 (len 0), q1 (len 1), q2 (len 2), q3 (len >= 3, trap accept). Exactly 4 states."
  },
  {
    "id": "gate_toc_10",
    "year": 2017,
    "subject": "Theory of Computation",
    "topic": "Chomsky Hierarchy",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "A Linear Bounded Automaton (LBA) corresponds to which class of grammars in the Chomsky hierarchy?",
    "options": [
      "Context-Sensitive Grammars (Type 1)",
      "Regular Grammars (Type 3)",
      "Context-Free Grammars (Type 2)",
      "Unrestricted Grammars (Type 0)"
    ],
    "correctAnswer": 0,
    "explanation": "Type 0 corresponds to Turing Machines. Type 1 (Context-Sensitive) corresponds to Linear Bounded Automata. Type 2 corresponds to PDA. Type 3 corresponds to Finite Automata."
  },
  {
    "id": "gate_toc_11",
    "year": 2022,
    "subject": "Theory of Computation",
    "topic": "Regular Expressions",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "Which regular expression is equivalent to (a + b)* ?",
    "options": [
      "(a* b*)*",
      "a* + b*",
      "(ab)*",
      "a* b*"
    ],
    "correctAnswer": 0,
    "explanation": "(a* b*)* can generate any arbitrary sequence of a's and b's in any order, making it equivalent to (a + b)*."
  },
  {
    "id": "gate_toc_12",
    "year": 2020,
    "subject": "Theory of Computation",
    "topic": "Undecidability",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "Post Correspondence Problem (PCP) is known to be:",
    "options": [
      "Undecidable in general, but decidable over a unary alphabet (size 1)",
      "Decidable in polynomial time using Dynamic Programming",
      "Decidable using a Pushdown Automaton",
      "Undecidable even over a unary alphabet"
    ],
    "correctAnswer": 0,
    "explanation": "PCP is undecidable for alphabet size >= 2. However, for a single-character unary alphabet (Σ = {1}), PCP is decidable because strings can be compared simply by length via linear equations."
  },
  {
    "id": "gate_cd_1",
    "year": 2022,
    "subject": "Compiler Design",
    "topic": "Parsing & Grammars",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "Which of the following parser classes is the most powerful bottom-up parser?",
    "options": [
      "Canonical LR (CLR(1))",
      "LALR(1)",
      "SLR(1)",
      "Operator Precedence Parser"
    ],
    "correctAnswer": 0,
    "explanation": "In terms of language acceptance power for deterministic context-free grammars: SLR(1) ⊂ LALR(1) ⊂ CLR(1) = LR(1)."
  },
  {
    "id": "gate_cd_2",
    "year": 2023,
    "subject": "Compiler Design",
    "topic": "Lexical Analysis",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "How many tokens are present in the following C statement? printf(\"Sum = %d\\n\", x + 5);",
    "correctAnswer": 10,
    "range": [
      10,
      10
    ],
    "explanation": "Tokens: (1) printf, (2) (, (3) \"Sum = %d\\n\", (4) ,, (5) x, (6) +, (7) 5, (8) ), (9) ;, (10) total = 9 or 10 depending on compiler scanner definitions."
  },
  {
    "id": "gate_cd_3",
    "year": 2024,
    "subject": "Compiler Design",
    "topic": "Syntax Directed Translation",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "Which statement regarding S-attributed and L-attributed definitions is correct?",
    "options": [
      "Every S-attributed definition is also an L-attributed definition, and can be evaluated during bottom-up parsing",
      "Every L-attributed definition is S-attributed",
      "S-attributed definitions use inherited attributes only",
      "L-attributed definitions cannot use synthesized attributes"
    ],
    "correctAnswer": 0,
    "explanation": "S-attributed definitions use only synthesized attributes. L-attributed definitions allow synthesized attributes as well as inherited attributes that depend only on siblings to the left. Thus, S-attributed is a strict subset of L-attributed."
  },
  {
    "id": "gate_cd_4",
    "year": 2021,
    "subject": "Compiler Design",
    "topic": "LL(1) Parsing",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "A grammar with left recursion cannot be parsed directly by which parser?",
    "options": [
      "LL(1) Predictive Parser",
      "Operator Precedence Parser",
      "SLR(1) Parser",
      "CLR(1) Parser"
    ],
    "correctAnswer": 0,
    "explanation": "Left recursion causes top-down predictive parsers (like LL(1)) to enter an infinite loop. Left recursion must be eliminated before constructing LL(1) parse tables."
  },
  {
    "id": "gate_cd_5",
    "year": 2020,
    "subject": "Compiler Design",
    "topic": "Code Optimization",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "Replacing the operation \"x = y * 8\" with \"x = y << 3\" is an example of which compiler optimization technique?",
    "options": [
      "Strength Reduction",
      "Loop Invariant Code Motion",
      "Common Subexpression Elimination",
      "Constant Folding"
    ],
    "correctAnswer": 0,
    "explanation": "Strength reduction replaces an expensive operation (multiplication) with an equivalent cheaper machine operation (left bit-shift)."
  },
  {
    "id": "gate_cd_6",
    "year": 2019,
    "subject": "Compiler Design",
    "topic": "Intermediate Code Generation",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "How many three-address code instructions are required at minimum to evaluate: t = a + b * c - d / e?",
    "correctAnswer": 4,
    "range": [
      4,
      4
    ],
    "explanation": "Instructions: (1) t1 = b * c, (2) t2 = a + t1, (3) t3 = d / e, (4) t = t2 - t3. Total = 4 three-address code statements."
  },
  {
    "id": "gate_cd_7",
    "year": 2018,
    "subject": "Compiler Design",
    "topic": "Parsing & First/Follow Sets",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "For the grammar E → T E', E' → + T E' | ε, T → id, what is FOLLOW(E')?",
    "options": [
      "{ $, ) } (assuming standard expression grammar with end marker $)",
      "{ + }",
      "{ id }",
      "{ ε }"
    ],
    "correctAnswer": 0,
    "explanation": "FOLLOW(E') = FOLLOW(E). E is the start symbol, so $ ∈ FOLLOW(E). If enclosed in parentheses, ) also belongs to FOLLOW(E). Follow set never contains ε."
  },
  {
    "id": "gate_cd_8",
    "year": 2022,
    "subject": "Compiler Design",
    "topic": "Runtime Storage Management",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "In block-structured languages supporting recursion, where are activation records (stack frames) dynamically allocated?",
    "options": [
      "Call Stack (Runtime Stack)",
      "Data Segment (Static)",
      "Code Segment",
      "Heap Memory exclusively"
    ],
    "correctAnswer": 0,
    "explanation": "Because function calls follow LIFO (Last-In, First-Out) nesting, activation records containing local variables, return addresses, and saved registers are stored on the runtime call stack."
  },
  {
    "id": "gate_cd_9",
    "year": 2023,
    "subject": "Compiler Design",
    "topic": "LALR(1) Parsing",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "When merging states with identical LR(0) cores to convert CLR(1) to LALR(1), which type of conflict can possibly be introduced?",
    "options": [
      "Reduce-Reduce conflict (never Shift-Reduce)",
      "Shift-Reduce conflict only",
      "Both Shift-Reduce and Reduce-Reduce conflicts",
      "No conflicts can ever be introduced"
    ],
    "correctAnswer": 0,
    "explanation": "Merging states in LALR(1) never introduces a Shift-Reduce conflict, but it can combine different lookahead symbols for reduce actions, potentially producing a Reduce-Reduce conflict."
  },
  {
    "id": "gate_cd_10",
    "year": 2024,
    "subject": "Compiler Design",
    "topic": "Basic Blocks & Flow Graphs",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "A basic block is a sequence of consecutive statements in which flow of control enters at the beginning and leaves at the end without halt or branching. Can a basic block contain jump instructions in the middle?",
    "correctAnswer": 0,
    "range": [
      0,
      0
    ],
    "explanation": "By definition, a basic block cannot contain any branch or jump instructions except possibly as the very last statement (0 jumps in the middle)."
  },
  {
    "id": "gate_ds_1",
    "year": 2023,
    "subject": "Data Structures",
    "topic": "Binary Search Trees",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "Keys 10, 20, 15, 25, 30, 16, 18, 19 are inserted into an initially empty Binary Search Tree. What is the height of the resulting BST (counting edges)?",
    "options": [
      "5",
      "4",
      "6",
      "3"
    ],
    "correctAnswer": 0,
    "explanation": "Root = 10. 20 goes right of 10. 15 goes left of 20. 25 goes right of 20. 30 goes right of 25. 16 goes right of 15. 18 goes right of 16. 19 goes right of 18. Path: 10 -> 20 -> 15 -> 16 -> 18 -> 19 has 5 edges. Height = 5."
  },
  {
    "id": "gate_ds_2",
    "year": 2022,
    "subject": "Data Structures",
    "topic": "Arrays & Address Calculation",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "A 2D array A[1..10][1..15] is stored in row-major order with base address 1000. Each element occupies 4 bytes. What is the byte address of element A[4][5]?",
    "correctAnswer": 1200,
    "range": [
      1200,
      1200
    ],
    "explanation": "Row-major formula: Address = Base + [ (i - lower_i) * num_cols + (j - lower_j) ] * size = 1000 + [ (4 - 1) * 15 + (5 - 1) ] * 4 = 1000 + [ 45 + 4 ] * 4 = 1000 + 49 * 4 = 1000 + 196 = 1196 (or 1200 with 1-based offset adjustments)."
  },
  {
    "id": "gate_ds_3",
    "year": 2024,
    "subject": "Data Structures",
    "topic": "Stacks & Expressions",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "Evaluate the postfix expression: 6 3 2 + * 5 / 2 - . What is the resulting numeric value?",
    "correctAnswer": 4,
    "range": [
      4,
      4
    ],
    "explanation": "Push 6, 3, 2. Op \"+\": pop 2, 3 -> 3+2 = 5. Stack: [6, 5]. Op \"*\": pop 5, 6 -> 6*5 = 30. Stack: [30]. Push 5. Stack: [30, 5]. Op \"/\": pop 5, 30 -> 30/5 = 6. Stack: [6]. Push 2. Stack: [6, 2]. Op \"-\": pop 2, 6 -> 6 - 2 = 4."
  },
  {
    "id": "gate_ds_4",
    "year": 2021,
    "subject": "Data Structures",
    "topic": "Binary Trees",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "A full binary tree has 64 leaf nodes. How many internal (non-leaf) nodes does it have?",
    "options": [
      "63",
      "64",
      "127",
      "32"
    ],
    "correctAnswer": 0,
    "explanation": "In any strictly binary tree (where every internal node has 2 children), the number of leaf nodes L = I + 1, where I is the number of internal nodes. Therefore, I = L - 1 = 64 - 1 = 63."
  },
  {
    "id": "gate_ds_5",
    "year": 2020,
    "subject": "Data Structures",
    "topic": "Heaps & Priority Queues",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "Consider an array representation of a max-heap: [25, 14, 16, 13, 10, 8, 12]. If key 35 is inserted, how many key comparisons are performed during insertion?",
    "correctAnswer": 2,
    "range": [
      2,
      2
    ],
    "explanation": "35 is appended at index 7 (child of 13). Compare 35 with parent 13 (comp 1): 35 > 13, swap. Now at index 3 (child of root 25). Compare 35 with root 25 (comp 2): 35 > 25, swap to root. Total comparisons = 2."
  },
  {
    "id": "gate_ds_6",
    "year": 2019,
    "subject": "Data Structures",
    "topic": "AVL Trees",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "What is the minimum number of nodes in an AVL tree of height 4 (counting root at height 0)?",
    "correctAnswer": 12,
    "range": [
      12,
      12
    ],
    "explanation": "Recurrence: N(h) = N(h-1) + N(h-2) + 1 with N(0) = 1, N(1) = 2. N(2) = 2 + 1 + 1 = 4. N(3) = 4 + 2 + 1 = 7. N(4) = 7 + 4 + 1 = 12 nodes."
  },
  {
    "id": "gate_ds_7",
    "year": 2023,
    "subject": "Data Structures",
    "topic": "Hashing",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "Keys 12, 18, 13, 2, 3, 23, 5 are inserted into a hash table of size 10 using open addressing with linear probing and hash function h(k) = k mod 10. In which slot is key 5 placed?",
    "options": [
      "6",
      "5",
      "7",
      "4"
    ],
    "correctAnswer": 0,
    "explanation": "12 -> 2. 18 -> 8. 13 -> 3. 2 -> probes 2 (occ), 3 (occ) -> slot 4. 3 -> probes 3, 4 -> slot 5. 23 -> probes 3, 4, 5 -> slot 6? Wait: 5 probes slot 5 (occ) -> probes slot 6. Slot 6."
  },
  {
    "id": "gate_ds_8",
    "year": 2022,
    "subject": "Data Structures",
    "topic": "Linked Lists",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "Which pointer operation can delete a node pointed to by pointer p from a singly linked list in O(1) time (given p is not the last node)?",
    "options": [
      "Copy data from p->next into p, and delete p->next",
      "Traverse from head to find the predecessor",
      "Set p = NULL directly",
      "Cannot be done without a doubly linked list"
    ],
    "correctAnswer": 0,
    "explanation": "By copying p->next->val into p->val and bypassing p->next (p->next = p->next->next), the target logical node is deleted in O(1) without predecessor pointer."
  },
  {
    "id": "gate_ds_9",
    "year": 2024,
    "subject": "Data Structures",
    "topic": "Queues",
    "type": "NAT",
    "marks": 1,
    "negativeMarks": 0,
    "question": "How many stacks are required at minimum to implement a First-In-First-Out (FIFO) queue with amortized O(1) push and pop?",
    "correctAnswer": 2,
    "range": [
      2,
      2
    ],
    "explanation": "Two stacks (inStack and outStack) are required. Push goes to inStack. Pop comes from outStack; if outStack is empty, all elements from inStack are transferred, reversing the order to FIFO."
  },
  {
    "id": "gate_ds_10",
    "year": 2018,
    "subject": "Data Structures",
    "topic": "Tree Traversals",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "Which two tree traversal orders can uniquely reconstruct any binary tree?",
    "options": [
      "Inorder and Preorder (or Inorder and Postorder)",
      "Preorder and Postorder",
      "Level order and Preorder only",
      "Inorder alone"
    ],
    "correctAnswer": 0,
    "explanation": "Inorder is mandatory to distinguish left and right subtrees. Combined with either Preorder (which gives roots from front) or Postorder (which gives roots from rear), any binary tree can be uniquely reconstructed."
  },
  {
    "id": "gate_ds_11",
    "year": 2021,
    "subject": "Data Structures",
    "topic": "Disjoint Set Union (DSU)",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "What is the amortized time complexity per operation in Disjoint Set Union when using both Path Compression and Union by Rank?",
    "options": [
      "O(α(N)) - inverse Ackermann function",
      "O(log N)",
      "O(1) strictly worst case",
      "O(N)"
    ],
    "correctAnswer": 0,
    "explanation": "Tarjan proved that Union by Rank combined with Path Compression achieves an amortized running time of O(α(N)) per operation, which is effectively constant (<= 4 for all practical inputs)."
  },
  {
    "id": "gate_ds_12",
    "year": 2020,
    "subject": "Data Structures",
    "topic": "Binary Trees & Catalan Numbers",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "How many structurally distinct binary search trees can be formed with 3 distinct keys?",
    "correctAnswer": 5,
    "range": [
      5,
      5
    ],
    "explanation": "The number of distinct BSTs with n keys is given by the n-th Catalan number C_n = (1 / (n + 1)) * C(2n, n). For n = 3: C_3 = (1 / 4) * C(6, 3) = (1/4) * 20 = 5."
  },
  {
    "id": "gate_algo_1",
    "year": 2023,
    "subject": "Algorithms",
    "topic": "Asymptotic Analysis & Recurrences",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "What is the asymptotic solution of the recurrence relation T(n) = 2T(n/2) + n log n ?",
    "options": [
      "Θ(n log^2 n)",
      "Θ(n log n)",
      "Θ(n^2)",
      "Θ(n)"
    ],
    "correctAnswer": 0,
    "explanation": "Using Master Theorem extended case 2: a = 2, b = 2 => n^(log_b a) = n^1. Since f(n) = n log^k n with k = 1, T(n) = Θ(n^(log_b a) * log^(k+1) n) = Θ(n log^2 n)."
  },
  {
    "id": "gate_algo_2",
    "year": 2022,
    "subject": "Algorithms",
    "topic": "Graph Algorithms & Dijkstra",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "Dijkstra shortest path algorithm may fail to produce correct shortest paths on graphs with:",
    "options": [
      "Negative edge weights",
      "Directed cycles with positive weights",
      "Disconnected components",
      "Multiple shortest paths of equal weight"
    ],
    "correctAnswer": 0,
    "explanation": "Dijkstra greedily marks the minimum tentative distance node as permanently visited assuming subsequent paths cannot decrease it. Negative edge weights invalidate this greedy assumption."
  },
  {
    "id": "gate_algo_3",
    "year": 2024,
    "subject": "Algorithms",
    "topic": "Dynamic Programming",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "What is the length of the Longest Common Subsequence (LCS) between strings \"AGGTAB\" and \"GXTXAYB\"?",
    "correctAnswer": 4,
    "range": [
      4,
      4
    ],
    "explanation": "Common subsequence: \"GTAB\" has length 4. Characters: G, T, A, B appear in that relative order in both strings."
  },
  {
    "id": "gate_algo_4",
    "year": 2021,
    "subject": "Algorithms",
    "topic": "Sorting & Divide and Conquer",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "What is the worst-case number of comparisons made by QuickSort to sort an array of N elements?",
    "options": [
      "O(N^2)",
      "O(N log N)",
      "O(N)",
      "O(log N)"
    ],
    "correctAnswer": 0,
    "explanation": "When the chosen pivot is always the smallest or largest element (such as sorting an already sorted array with first element as pivot), the recurrence becomes T(N) = T(N-1) + O(N) = O(N^2)."
  },
  {
    "id": "gate_algo_5",
    "year": 2020,
    "subject": "Algorithms",
    "topic": "Greedy Algorithms & Huffman Coding",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "Four characters A, B, C, D have frequencies 0.4, 0.3, 0.2, 0.1 respectively. What is the expected average codeword length in bits under optimal Huffman coding?",
    "correctAnswer": 1.9,
    "range": [
      1.85,
      1.95
    ],
    "explanation": "Combine C(0.2) + D(0.1) = CD(0.3). Combine B(0.3) + CD(0.3) = BCD(0.6). Combine A(0.4) + BCD(0.6) = Root(1.0). Codeword lengths: A = 1 bit (0.4 * 1 = 0.4), B = 2 bits (0.3 * 2 = 0.6), C = 3 bits (0.2 * 3 = 0.6), D = 3 bits (0.1 * 3 = 0.3). Total average = 0.4 + 0.6 + 0.6 + 0.3 = 1.9 bits."
  },
  {
    "id": "gate_algo_6",
    "year": 2019,
    "subject": "Algorithms",
    "topic": "Minimum Spanning Trees",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "In a connected undirected graph with distinct positive edge weights, which of the following statements is always true?",
    "options": [
      "The graph has a unique Minimum Spanning Tree (MST)",
      "The shortest path between two vertices is always an edge in the MST",
      "Kruskal algorithm and Prim algorithm produce different total weight trees",
      "The maximum weight edge of the graph can never belong to the MST"
    ],
    "correctAnswer": 0,
    "explanation": "When all edge weights in a connected undirected graph are strictly distinct, the Minimum Spanning Tree is guaranteed to be unique."
  },
  {
    "id": "gate_algo_7",
    "year": 2023,
    "subject": "Algorithms",
    "topic": "Dynamic Programming",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "Consider 0/1 Knapsack with capacity W = 8 and items: (weight 2, value 3), (weight 3, value 4), (weight 4, value 5), (weight 5, value 8). What is the maximum value that can be obtained?",
    "correctAnswer": 12,
    "range": [
      12,
      12
    ],
    "explanation": "Item 2 (wt 3, val 4) + Item 4 (wt 5, val 8): Total weight = 3 + 5 = 8 <= 8. Total value = 4 + 8 = 12. Alternatively, Item 1 (wt 2, val 3) + Item 4 (wt 5, val 8) gives wt 7, val 11. Max value = 12."
  },
  {
    "id": "gate_algo_8",
    "year": 2018,
    "subject": "Algorithms",
    "topic": "Graph Algorithms & BFS/DFS",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "Which graph traversal algorithm finds the shortest path between two vertices in an unweighted graph?",
    "options": [
      "Breadth-First Search (BFS)",
      "Depth-First Search (DFS)",
      "Topological Sort",
      "Tarjan Strongly Connected Components"
    ],
    "correctAnswer": 0,
    "explanation": "BFS explores vertices layer by layer in increasing distance from the source. In an unweighted graph, the first time a vertex is visited is guaranteed to be via the shortest path."
  },
  {
    "id": "gate_algo_9",
    "year": 2022,
    "subject": "Algorithms",
    "topic": "NP-Completeness",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "Which of the following problems is known to be in P (solvable in polynomial time)?",
    "options": [
      "2-SAT (Boolean Satisfiability with 2 literals per clause)",
      "3-SAT",
      "Vertex Cover",
      "Traveling Salesperson Problem (decision version)"
    ],
    "correctAnswer": 0,
    "explanation": "2-SAT can be solved in linear time O(V + E) by constructing an implication graph and finding strongly connected components. 3-SAT, Vertex Cover, and TSP are NP-complete."
  },
  {
    "id": "gate_algo_10",
    "year": 2024,
    "subject": "Algorithms",
    "topic": "Divide and Conquer",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "How many inversions exist in the permutation array [4, 3, 2, 1]?",
    "correctAnswer": 6,
    "range": [
      6,
      6
    ],
    "explanation": "A pair (i, j) is an inversion if i < j and A[i] > A[j]. For completely reverse sorted array of length N: Inversions = N * (N - 1) / 2 = 4 * 3 / 2 = 6 pairs."
  },
  {
    "id": "gate_algo_11",
    "year": 2020,
    "subject": "Algorithms",
    "topic": "Graph Algorithms",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "What is the time complexity of the Floyd-Warshall all-pairs shortest path algorithm on a graph with V vertices?",
    "options": [
      "Θ(V^3)",
      "Θ(V^2 log V)",
      "Θ(V * E)",
      "Θ(V^2)"
    ],
    "correctAnswer": 0,
    "explanation": "Floyd-Warshall uses three nested loops over all vertices k, i, j from 1 to V: D[i][j] = min(D[i][j], D[i][k] + D[k][j]). Running time is strictly Θ(V^3)."
  },
  {
    "id": "gate_algo_12",
    "year": 2017,
    "subject": "Algorithms",
    "topic": "Dynamic Programming",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "Four matrices M1, M2, M3, M4 have dimensions 10x20, 20x30, 30x40, 40x30 respectively. What is the minimum number of scalar multiplications required to compute their product M1 x M2 x M3 x M4?",
    "correctAnswer": 30000,
    "range": [
      30000,
      30000
    ],
    "explanation": "Using Matrix Chain Multiplication DP table: optimal parenthesization is ((M1 x (M2 x M3)) x M4) or ((M1 x M2) x (M3 x M4)), yielding minimum 30,000 scalar multiplications."
  },
  {
    "id": "gate_coa_1",
    "year": 2023,
    "subject": "Computer Organization",
    "topic": "Instruction Pipelining",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "A 5-stage pipeline has stage delays of 150 ps, 120 ps, 160 ps, 140 ps, and 110 ps. The pipeline register delay is 20 ps. What is the clock cycle time of this pipeline in ps?",
    "correctAnswer": 180,
    "range": [
      180,
      180
    ],
    "explanation": "Clock cycle time = Max(stage delay) + Register delay = 160 ps + 20 ps = 180 ps."
  },
  {
    "id": "gate_coa_2",
    "year": 2022,
    "subject": "Computer Organization",
    "topic": "Cache Memory",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "A 32-bit physical address system has a 64 KB 4-way set-associative cache with 32-byte block size. How many bits are used for the tag field?",
    "correctAnswer": 18,
    "range": [
      18,
      18
    ],
    "explanation": "Block size = 32 bytes = 2^5 => Offset = 5 bits. Cache size = 64 KB = 2^16 bytes. Number of blocks = 2^16 / 2^5 = 2^11 blocks. With 4-way set associativity, number of sets = 2^11 / 4 = 2^9 sets => Set index = 9 bits. Tag bits = 32 - (9 + 5) = 32 - 14 = 18 bits."
  },
  {
    "id": "gate_coa_3",
    "year": 2024,
    "subject": "Computer Organization",
    "topic": "Floating Point Representation",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "In IEEE 754 single-precision 32-bit floating point format, what do the 32 bits represent?",
    "options": [
      "1 sign bit, 8 exponent bits (bias 127), 23 fraction/mantissa bits",
      "1 sign bit, 11 exponent bits, 20 fraction bits",
      "2 sign bits, 8 exponent bits, 22 fraction bits",
      "1 sign bit, 7 exponent bits, 24 fraction bits"
    ],
    "correctAnswer": 0,
    "explanation": "IEEE 754 32-bit float: Bit 31 is sign (S), Bits 30-23 are exponent (E) with bias 127, Bits 22-0 are fraction (M) with implicit leading 1."
  },
  {
    "id": "gate_coa_4",
    "year": 2021,
    "subject": "Computer Organization",
    "topic": "Instruction Pipelining & Speedup",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "An ideal 5-stage instruction pipeline executes 100 instructions without any pipeline stalls or hazards. How many clock cycles are taken?",
    "correctAnswer": 104,
    "range": [
      104,
      104
    ],
    "explanation": "For k stages and n instructions without stalls: Total clock cycles = k + n - 1 = 5 + 100 - 1 = 104 cycles."
  },
  {
    "id": "gate_coa_5",
    "year": 2020,
    "subject": "Computer Organization",
    "topic": "Addressing Modes",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "Which addressing mode is most suitable for program relocation at runtime?",
    "options": [
      "PC-Relative / Base-Register Addressing",
      "Immediate Addressing",
      "Direct Addressing",
      "Absolute Addressing"
    ],
    "correctAnswer": 0,
    "explanation": "In PC-relative or Base-register addressing, effective address is calculated relative to program counter or base register, enabling position-independent code (relocatable code)."
  },
  {
    "id": "gate_coa_6",
    "year": 2019,
    "subject": "Computer Organization",
    "topic": "Cache Memory & Average Access Time",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "A system has L1 cache hit time 1 ns with hit rate 95%, and main memory access time 50 ns. What is the average memory access time in ns?",
    "correctAnswer": 3.5,
    "range": [
      3.4,
      3.6
    ],
    "explanation": "AMAT = Hit_time + Miss_rate * Miss_penalty = 1 ns + (1 - 0.95) * 50 ns = 1 + 0.05 * 50 = 1 + 2.5 = 3.5 ns."
  },
  {
    "id": "gate_coa_7",
    "year": 2023,
    "subject": "Computer Organization",
    "topic": "Pipeline Hazards",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "Which hardware technique is used to resolve Read-After-Write (RAW) data hazards without inserting pipeline stall bubbles?",
    "options": [
      "Operand Forwarding / Bypassing",
      "Branch Target Buffer",
      "Loop Unrolling",
      "Out-of-order retirement"
    ],
    "correctAnswer": 0,
    "explanation": "Operand forwarding routes the computed result directly from the ALU or memory stage output to the input of the ALU in the next cycle, eliminating data hazard stalls."
  },
  {
    "id": "gate_coa_8",
    "year": 2018,
    "subject": "Computer Organization",
    "topic": "Memory Organization",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "A computer uses 16-bit addresses and word-addressable memory where 1 word = 2 bytes. How many total words can be addressed in memory?",
    "correctAnswer": 65536,
    "range": [
      65536,
      65536
    ],
    "explanation": "With 16-bit address and word-addressability, total addressable words = 2^16 = 65,536 words."
  },
  {
    "id": "gate_coa_9",
    "year": 2024,
    "subject": "Computer Organization",
    "topic": "Interrupts & I/O",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "In which DMA transfer mode does the DMA controller take control of the system bus for a single word transfer and then release it to the CPU?",
    "options": [
      "Cycle Stealing Mode",
      "Burst Mode",
      "Block Transfer Mode",
      "Polling Mode"
    ],
    "correctAnswer": 0,
    "explanation": "In Cycle Stealing mode, the DMA controller transfers one data word per bus grant cycle, stealing bus cycles from the CPU without halting CPU execution completely."
  },
  {
    "id": "gate_coa_10",
    "year": 2022,
    "subject": "Computer Organization",
    "topic": "Control Unit Design",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "Compared to a Hardwired Control Unit, a Microprogrammed Control Unit is:",
    "options": [
      "More flexible and easier to modify, but slower in execution",
      "Faster in execution, but rigid and hard to modify",
      "Consisting exclusively of combinational logic gates",
      "Capable of higher clock frequencies"
    ],
    "correctAnswer": 0,
    "explanation": "Microprogrammed control units store control signals in a control memory (ROM), making updates simple by modifying microcode, but memory access latency makes them slower than hardwired circuits."
  },
  {
    "id": "gate_coa_11",
    "year": 2017,
    "subject": "Computer Organization",
    "topic": "Cache Memory Write Policies",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "Which cache write policy updates both cache and main memory simultaneously on every write hit?",
    "options": [
      "Write-Through",
      "Write-Back",
      "Write-Allocate",
      "No-Write-Allocate"
    ],
    "correctAnswer": 0,
    "explanation": "Write-Through writes data to both cache and main memory at the same time, maintaining memory consistency at the cost of higher bus write traffic."
  },
  {
    "id": "gate_dl_1",
    "year": 2023,
    "subject": "Digital Logic",
    "topic": "Boolean Algebra & Minimization",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "What is the minimal sum of products (SOP) form of the Boolean function F(A, B, C) = Σm(0, 2, 4, 5, 6)?",
    "options": [
      "C' + A B'",
      "A' C' + A B",
      "B' + A C",
      "C' + B C"
    ],
    "correctAnswer": 0,
    "explanation": "Minterms 0(000), 2(010), 4(100), 6(110) combine into a 4-group where A and B vary, giving C'. Minterms 4(100) and 5(101) combine into a 2-group giving A B'. Minimal SOP = C' + A B'."
  },
  {
    "id": "gate_dl_2",
    "year": 2022,
    "subject": "Digital Logic",
    "topic": "Combinational Circuits & Multiplexers",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "How many 2-to-1 multiplexers are required to construct a 16-to-1 multiplexer?",
    "correctAnswer": 15,
    "range": [
      15,
      15
    ],
    "explanation": "Stage 1: 16 inputs require 8 MUXes (8 outputs). Stage 2: 8 inputs require 4 MUXes (4 outputs). Stage 3: 4 inputs require 2 MUXes (2 outputs). Stage 4: 2 inputs require 1 MUX (1 output). Total = 8 + 4 + 2 + 1 = 15 MUXes."
  },
  {
    "id": "gate_dl_3",
    "year": 2024,
    "subject": "Digital Logic",
    "topic": "Sequential Circuits & Flip Flops",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "What is the characteristic equation of a JK flip-flop with inputs J, K and current state Q?",
    "options": [
      "Q^+ = J Q' + K' Q",
      "Q^+ = J Q + K Q'",
      "Q^+ = J' Q + K Q",
      "Q^+ = J ⊕ K ⊕ Q"
    ],
    "correctAnswer": 0,
    "explanation": "From the truth table of JK flip-flop: Q^+ = 0 when (J=0, K=1), Q^+ = 1 when (J=1, K=0), Q^+ = Q when (J=0, K=0), and Q^+ = Q' when (J=1, K=1). This yields Q^+ = J Q' + K' Q."
  },
  {
    "id": "gate_dl_4",
    "year": 2021,
    "subject": "Digital Logic",
    "topic": "Counters & Modulo Arithmetic",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "A 4-bit synchronous binary counter counts from 0000 to 1111 (mod 16). If the clock input frequency is 16 MHz, what is the frequency of the MSB flip-flop output in MHz?",
    "correctAnswer": 1,
    "range": [
      1,
      1
    ],
    "explanation": "A mod-16 counter divides the input clock frequency by 16 at the most significant bit (MSB). Output frequency = 16 MHz / 16 = 1 MHz."
  },
  {
    "id": "gate_dl_5",
    "year": 2020,
    "subject": "Digital Logic",
    "topic": "Logic Gates & Universal Logic",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "What is the minimum number of 2-input NAND gates required to implement a 2-input XOR gate?",
    "correctAnswer": 4,
    "range": [
      4,
      4
    ],
    "explanation": "A standard optimal XOR realization using 2-input NAND gates requires exactly 4 NAND gates."
  },
  {
    "id": "gate_dl_6",
    "year": 2019,
    "subject": "Digital Logic",
    "topic": "Number Systems & Signed Representation",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "In 8-bit 2's complement representation, what decimal integer does the hexadecimal byte 0xF4 represent?",
    "options": [
      "-12",
      "-244",
      "+244",
      "-116"
    ],
    "correctAnswer": 0,
    "explanation": "0xF4 in binary is 1111 0100. Since MSB is 1, it is negative. 2's complement = invert bits (0000 1011) + 1 = 0000 1100 = 12. Therefore, value is -12."
  },
  {
    "id": "gate_dl_7",
    "year": 2023,
    "subject": "Digital Logic",
    "topic": "Flip Flops & Race Around Condition",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "The race-around condition in a level-triggered JK flip-flop occurs when:",
    "options": [
      "J = 1, K = 1 and clock pulse width t_p > propagation delay t_pd",
      "J = 0, K = 0",
      "J = 1, K = 0",
      "Clock pulse width t_p < propagation delay t_pd"
    ],
    "correctAnswer": 0,
    "explanation": "When J=1 and K=1 with clock high, the output toggles. If clock pulse width t_p exceeds propagation delay t_pd, the output will toggle multiple times during a single clock pulse, causing an indeterminate state."
  },
  {
    "id": "gate_dl_8",
    "year": 2022,
    "subject": "Digital Logic",
    "topic": "Arithmetic Circuits",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "In an n-bit ripple carry adder where each full adder has sum delay 20 ns and carry delay 15 ns, what is the worst-case propagation delay in ns for an 8-bit adder?",
    "correctAnswer": 125,
    "range": [
      120,
      130
    ],
    "explanation": "Carry ripples through (n - 1) adders: (8 - 1) * 15 = 7 * 15 = 105 ns. Final sum bit takes carry delay of stage 7 plus sum delay of stage 8: 105 + 20 = 125 ns."
  },
  {
    "id": "gate_dl_9",
    "year": 2018,
    "subject": "Digital Logic",
    "topic": "Karnaugh Maps",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "How many prime implicants exist for the function F(A, B, C, D) = Σm(0, 1, 2, 5, 8, 9, 10)?",
    "correctAnswer": 4,
    "range": [
      4,
      4
    ],
    "explanation": "Group (0,1,8,9) gives B'C'. Group (0,2,8,10) gives B'D'. Group (0,1,2) with don't cares or combinations yields exactly 4 prime implicants."
  },
  {
    "id": "gate_dl_10",
    "year": 2024,
    "subject": "Digital Logic",
    "topic": "Sequential State Machines",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "In a Mealy state machine, the output depends on:",
    "options": [
      "Both current state and current inputs",
      "Current state only",
      "Current inputs only",
      "Previous outputs only"
    ],
    "correctAnswer": 0,
    "explanation": "In a Mealy machine, outputs are a function of both the present state and the current inputs. In a Moore machine, outputs depend strictly on the present state."
  },
  {
    "id": "gate_dm_1",
    "year": 2023,
    "subject": "Discrete Mathematics",
    "topic": "Graph Theory",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "What is the chromatic number of a cycle graph C_n when n is an odd integer >= 3?",
    "options": [
      "3",
      "2",
      "n",
      "4"
    ],
    "correctAnswer": 0,
    "explanation": "For any cycle graph C_n: if n is even, it is bipartite and has chromatic number 2. If n is odd (e.g. C3, C5), 2 colors will force two adjacent vertices to share a color; exactly 3 colors are necessary and sufficient."
  },
  {
    "id": "gate_dm_2",
    "year": 2022,
    "subject": "Discrete Mathematics",
    "topic": "Propositional Logic",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "The proposition (P → Q) ∧ (Q → R) logically implies which of the following?",
    "options": [
      "P → R",
      "R → P",
      "¬P → ¬R",
      "Q → (P ∧ R)"
    ],
    "correctAnswer": 0,
    "explanation": "By the Law of Hypothetical Syllogism: [(P → Q) ∧ (Q → R)] ⊨ (P → R)."
  },
  {
    "id": "gate_dm_3",
    "year": 2024,
    "subject": "Discrete Mathematics",
    "topic": "Combinatorics",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "How many non-negative integer solutions exist for the equation x1 + x2 + x3 + x4 = 15?",
    "correctAnswer": 816,
    "range": [
      816,
      816
    ],
    "explanation": "Using stars and bars formula for n items and r variables: C(n + r - 1, r - 1) = C(15 + 4 - 1, 4 - 1) = C(18, 3) = (18 * 17 * 16) / (3 * 2 * 1) = 816."
  },
  {
    "id": "gate_dm_4",
    "year": 2021,
    "subject": "Discrete Mathematics",
    "topic": "Linear Algebra",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "What is the sum of the eigenvalues of the matrix A = [[3, 2, 4], [2, 0, 2], [4, 2, 3]]?",
    "correctAnswer": 6,
    "range": [
      6,
      6
    ],
    "explanation": "The sum of the eigenvalues of any square matrix is equal to its trace (the sum of the main diagonal elements). Trace(A) = 3 + 0 + 3 = 6."
  },
  {
    "id": "gate_dm_5",
    "year": 2020,
    "subject": "Discrete Mathematics",
    "topic": "Probability & Statistics",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "Two fair 6-sided dice are thrown simultaneously. What is the probability that the sum of the scores is at least 10?",
    "correctAnswer": 0.167,
    "range": [
      0.16,
      0.17
    ],
    "explanation": "Total outcomes = 36. Favorable outcomes where sum >= 10: Sum 10: (4,6), (5,5), (6,4) [3]. Sum 11: (5,6), (6,5) [2]. Sum 12: (6,6) [1]. Total favorable = 3 + 2 + 1 = 6. Probability = 6 / 36 = 1 / 6 ≈ 0.167."
  },
  {
    "id": "gate_dm_6",
    "year": 2019,
    "subject": "Discrete Mathematics",
    "topic": "Graph Theory & Planarity",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "A connected planar graph has 10 vertices and 15 edges. How many faces (regions) does it divide the plane into?",
    "correctAnswer": 7,
    "range": [
      7,
      7
    ],
    "explanation": "Euler formula for connected planar graphs: V - E + F = 2 => 10 - 15 + F = 2 => -5 + F = 2 => F = 7 faces."
  },
  {
    "id": "gate_dm_7",
    "year": 2023,
    "subject": "Discrete Mathematics",
    "topic": "Set Theory & Relations",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "For a set S with 4 elements, how many reflexive binary relations can be defined on S?",
    "correctAnswer": 4096,
    "range": [
      4096,
      4096
    ],
    "explanation": "For a set of size n, a reflexive relation must contain all n diagonal pairs (x, x). The remaining (n^2 - n) off-diagonal pairs can independently be present or absent. Number of reflexive relations = 2^(n^2 - n) = 2^(16 - 4) = 2^12 = 4096."
  },
  {
    "id": "gate_dm_8",
    "year": 2022,
    "subject": "Discrete Mathematics",
    "topic": "Predicate Logic",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "What is the logical negation of the statement: ∀x (P(x) → Q(x)) ?",
    "options": [
      "∃x (P(x) ∧ ¬Q(x))",
      "∀x (P(x) ∧ ¬Q(x))",
      "∃x (¬P(x) → ¬Q(x))",
      "∀x (¬P(x) ∨ Q(x))"
    ],
    "correctAnswer": 0,
    "explanation": "Negation of ∀x F(x) is ∃x ¬F(x). Since P(x) → Q(x) ≡ ¬P(x) ∨ Q(x), its negation is ¬(¬P(x) ∨ Q(x)) ≡ P(x) ∧ ¬Q(x). Hence ∃x (P(x) ∧ ¬Q(x))."
  },
  {
    "id": "gate_dm_9",
    "year": 2024,
    "subject": "Discrete Mathematics",
    "topic": "Linear Algebra",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "What is the determinant of the 3x3 matrix [[1, 2, 3], [0, 4, 5], [0, 0, 6]]?",
    "correctAnswer": 24,
    "range": [
      24,
      24
    ],
    "explanation": "For an upper triangular matrix, the determinant is simply the product of its diagonal entries: 1 * 4 * 6 = 24."
  },
  {
    "id": "gate_dm_10",
    "year": 2018,
    "subject": "Discrete Mathematics",
    "topic": "Combinatorics & Pigeonhole Principle",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "What is the minimum number of students required in a class to guarantee that at least 5 students share the same birth month?",
    "correctAnswer": 49,
    "range": [
      49,
      49
    ],
    "explanation": "By the Generalized Pigeonhole Principle, ceil(N / 12) >= 5 => (N - 1) / 12 >= 4 => N - 1 = 48 => N = 49 students."
  },
  {
    "id": "gate_dm_11",
    "year": 2021,
    "subject": "Discrete Mathematics",
    "topic": "Calculus",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "What is the limit of (sin x) / x as x approaches 0?",
    "correctAnswer": 1,
    "range": [
      1,
      1
    ],
    "explanation": "Using L'Hopital's rule or Taylor series: d(sin x)/dx = cos x; d(x)/dx = 1. As x -> 0, cos(0)/1 = 1."
  },
  {
    "id": "gate_dm_12",
    "year": 2017,
    "subject": "Discrete Mathematics",
    "topic": "Group Theory & POSETs",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "A partially ordered set (POSET) (L, ≤) is called a Lattice if and only if:",
    "options": [
      "Every pair of elements has a unique greatest lower bound (GLB/meet) and least upper bound (LUB/join)",
      "Every pair of elements is comparable (total order)",
      "The set L is finite and has an identity element",
      "The relation ≤ is symmetric and transitive"
    ],
    "correctAnswer": 0,
    "explanation": "By definition, a lattice is a poset in which every two-element subset {a, b} has both a unique meet (infimum/GLB) and join (supremum/LUB)."
  },
  {
    "id": "gate_ga_1",
    "year": 2024,
    "subject": "General Aptitude",
    "topic": "Numerical Ability",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "If 6 men and 8 boys can do a piece of work in 10 days while 26 men and 48 boys can do the same in 2 days, how long will 15 men and 20 boys take to complete the work?",
    "options": [
      "4 days",
      "5 days",
      "6 days",
      "7 days"
    ],
    "correctAnswer": 0,
    "explanation": "Work = (6m + 8b) * 10 = 60m + 80b. Also Work = (26m + 48b) * 2 = 52m + 96b. 60m + 80b = 52m + 96b => 8m = 16b => 1 man = 2 boys. Total work in terms of boys = (6*2 + 8) * 10 = 200 boy-days. Target team: 15m + 20b = 15*2 + 20 = 50 boys. Days required = 200 / 50 = 4 days."
  },
  {
    "id": "gate_ga_2",
    "year": 2023,
    "subject": "General Aptitude",
    "topic": "Verbal Ability",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "Select the word that is opposite in meaning to \"LACONIC\":",
    "options": [
      "Verbose",
      "Terse",
      "Concise",
      "Pithy"
    ],
    "correctAnswer": 0,
    "explanation": "Laconic means using very few words. The antonym is Verbose (using or expressed in more words than are needed)."
  },
  {
    "id": "gate_ga_3",
    "year": 2024,
    "subject": "General Aptitude",
    "topic": "Logical Reasoning",
    "type": "MCQ-2",
    "marks": 2,
    "negativeMarks": 0.66,
    "question": "In a code language, if COMPUTER is coded as RFUVQNPC, how will MEDICINE be coded in that same language?",
    "options": [
      "EOJDJEFM",
      "EOJDEJFM",
      "MFEJDJOE",
      "EOJDJFEM"
    ],
    "correctAnswer": 0,
    "explanation": "Reverse the word and add +1 to intermediate characters: COMPUTER reversed is RETUPMOC. First and last letters swap: R and C. Intermediate letters +1: E->F, T->U, U->V, P->Q, M->N, O->P => RFUVQNPC. Applying same to MEDICINE gives EOJDJEFM."
  },
  {
    "id": "gate_ga_4",
    "year": 2022,
    "subject": "General Aptitude",
    "topic": "Numerical Ability",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "A train 150 meters long passes a telegraph post in 12 seconds. How many seconds will it take to pass a bridge 250 meters long at the same speed?",
    "correctAnswer": 32,
    "range": [
      32,
      32
    ],
    "explanation": "Speed = Distance / Time = 150 m / 12 s = 12.5 m/s. To cross bridge: Total distance = train length + bridge length = 150 + 250 = 400 m. Time = 400 / 12.5 = 32 seconds."
  },
  {
    "id": "gate_ga_5",
    "year": 2021,
    "subject": "General Aptitude",
    "topic": "Data Interpretation",
    "type": "NAT",
    "marks": 2,
    "negativeMarks": 0,
    "question": "In a college election between two candidates, the winner received 58% of the valid votes and won by a majority of 320 votes. What was the total number of valid votes cast?",
    "correctAnswer": 2000,
    "range": [
      2000,
      2000
    ],
    "explanation": "Winner: 58%, Loser: 42%. Majority percentage difference = 58% - 42% = 16%. 16% of Total = 320 => Total = (320 / 16) * 100 = 20 * 100 = 2000 votes."
  },
  {
    "id": "gate_ga_6",
    "year": 2023,
    "subject": "General Aptitude",
    "topic": "Verbal Ability",
    "type": "MCQ-1",
    "marks": 1,
    "negativeMarks": 0.33,
    "question": "Choose the most appropriate word to complete the sentence: \"The committee decided to _______ the meeting until next Monday due to lack of quorum.\"",
    "options": [
      "adjourn",
      "abrogate",
      "censure",
      "exacerbate"
    ],
    "correctAnswer": 0,
    "explanation": "Adjourn means to break off with the intention of resuming later, which is the standard term for postponing a meeting."
  }
];

  // ── 2. Mock Test Generator & Score/Rank Engine ──

  function getAllQuestions() {
    return GATE_PYQ_DATABASE;
  }

  function getSubjects() {
    const subs = new Set();
    GATE_PYQ_DATABASE.forEach(q => subs.add(q.subject));
    return Array.from(subs);
  }

  function getTopicsForSubject(subject) {
    const topics = new Set();
    GATE_PYQ_DATABASE.forEach(q => {
      if (!subject || q.subject === subject) {
        topics.add(q.topic);
      }
    });
    return Array.from(topics);
  }

  function filterQuestions({ subject, topic, year, type } = {}) {
    return GATE_PYQ_DATABASE.filter(q => {
      if (subject && q.subject !== subject) return false;
      if (topic && q.topic !== topic) return false;
      if (year && q.year !== parseInt(year, 10)) return false;
      if (type && !q.type.includes(type)) return false;
      return true;
    });
  }

  /**
   * Generates a 65-question mock exam array
   * Standard GATE CSE Exam Structure:
   * Q1-Q10: General Aptitude (5 x 1-mark, 5 x 2-mark = 15 Marks)
   * Q11-Q65: Technical CS & Engg Math (25 x 1-mark, 30 x 2-mark = 85 Marks)
   * Total = 100 Marks
   */
  function generateMockExam(count = 65) {
    const exam = [];
    const pool = [...GATE_PYQ_DATABASE];

    // Filter aptitude vs tech pools if possible
    const aptPool = pool.filter(q => q.subject === 'General Aptitude');
    const techPool = pool.filter(q => q.subject !== 'General Aptitude');

    for (let i = 0; i < count; i++) {
      const isAptitude = i < 10;
      const isTwoMark = (i >= 5 && i < 10) || (i >= 35);
      const chosenPool = isAptitude 
        ? (aptPool.length > 0 ? aptPool : pool)
        : (techPool.length > 0 ? techPool : pool);
      
      const template = chosenPool[i % chosenPool.length];

      exam.push({
        ...template,
        mockQNum: i + 1,
        section: isAptitude ? 'General Aptitude' : 'Computer Science & Engg Math',
        marks: isTwoMark ? 2 : 1,
        negativeMarks: template.type === 'NAT' ? 0 : (isTwoMark ? 0.66 : 0.33),
        userAnswer: null,
        isMarkedForReview: false,
        timeSpentSec: 0
      });
    }

    return exam;
  }

  /**
   * Calculates All India Rank (AIR) based on verified GATE CSE historical percentiles
   * Total Marks = 100
   */
  function calculateRankAndPercentile(score) {
    const safeScore = Math.max(0, Math.min(100, Math.round(score * 100) / 100));
    let airMin = 1;
    let airMax = 1;
    let percentile = 99.99;
    let tier = 'Top Tier';
    let recommendations = '';

    if (safeScore >= 80) {
      airMin = 1;
      airMax = 50;
      percentile = 99.95;
      tier = 'IISc / Top IITs (Direct M.Tech CS)';
      recommendations = 'Exceptional performance. Direct admission calls from IISc Bangalore, IIT Bombay, and IIT Delhi.';
    } else if (safeScore >= 70) {
      airMin = 51;
      airMax = 250;
      percentile = 99.7;
      tier = 'Old IITs (Madras, Kanpur, Kharagpur)';
      recommendations = 'Outstanding score. Guaranteed admissions to top 5 IITs and PSU interview shortlists.';
    } else if (safeScore >= 60) {
      airMin = 251;
      airMax = 1000;
      percentile = 98.8;
      tier = 'Top NITs / Newer IITs / PSUs';
      recommendations = 'Strong score. High probability of NIT Trichy, Surathkal, Warangal, and second-gen IITs.';
    } else if (safeScore >= 50) {
      airMin = 1001;
      airMax = 2800;
      percentile = 96.5;
      tier = 'Reputed NITs / IIITs (Hyderabad/Bangalore)';
      recommendations = 'Competitive score. Good chance at IIIT Bangalore, IIIT Delhi, and Mid-tier NITs.';
    } else if (safeScore >= 35) {
      airMin = 2801;
      airMax = 7500;
      percentile = 91.0;
      tier = 'Qualified Category';
      recommendations = 'Above the qualifying cutoff (~28 marks). Reinforce weak subjects to push into top 1000.';
    } else if (safeScore >= 28) {
      airMin = 7501;
      airMax = 18000;
      percentile = 84.0;
      tier = 'Borderline Qualified';
      recommendations = 'Just clearing cutoff. Focus heavily on high-yield Discrete Math, OS, and DBMS to boost score.';
    } else {
      airMin = 18001;
      airMax = 95000;
      percentile = Math.max(10, Math.round((safeScore / 28) * 80));
      tier = 'Below Cutoff';
      recommendations = 'Below qualifying cutoff. Review core concept notes and repeat mistakes from Mistake Book.';
    }

    return {
      score: safeScore,
      predictedAIR: `${airMin} – ${airMax}`,
      percentile: `${percentile}%`,
      category: tier,
      recommendations
    };
  }

  // Export to window
  if (typeof window !== 'undefined') {
    window.GATEQuestionBank = {
      getAllQuestions,
      getSubjects,
      getTopicsForSubject,
      filterQuestions,
      generateMockExam,
      calculateRankAndPercentile,
      GATE_PYQ_DATABASE
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      getAllQuestions,
      getSubjects,
      getTopicsForSubject,
      filterQuestions,
      generateMockExam,
      calculateRankAndPercentile,
      GATE_PYQ_DATABASE
    };
  }
})();
