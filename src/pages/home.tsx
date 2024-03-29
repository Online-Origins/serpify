import { Lexend_Deca } from 'next/font/google';

const LexendDeca = Lexend_Deca({
  weight: '700',
  subsets: ['latin'],
})

export default function Home() {
  return (
    <main>
      <h1 className={LexendDeca.className}>Serpify</h1>
    </main>
  );
}
