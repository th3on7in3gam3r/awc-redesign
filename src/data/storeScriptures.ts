import type { StoreMinistry } from './storeProducts';

export type StoreScripture = {
  reference: string;
  text: string;
};

export const STORE_SCRIPTURES: Record<StoreMinistry, StoreScripture[]> = {
  youth: [
    {
      reference: '1 Timothy 4:12',
      text: 'Don’t let anyone look down on you because you are young, but set an example for the believers in speech, in conduct, in love, in faith and in purity.',
    },
    {
      reference: 'Proverbs 3:5–6',
      text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
    },
    {
      reference: 'Philippians 4:13',
      text: 'I can do all this through him who gives me strength.',
    },
    {
      reference: 'Jeremiah 29:11',
      text: '“For I know the plans I have for you,” declares the Lord, “plans to prosper you and not to harm you, plans to give you hope and a future.”',
    },
  ],
  men: [
    {
      reference: '1 Corinthians 16:13–14',
      text: 'Be on your guard; stand firm in the faith; be courageous; be strong. Do everything in love.',
    },
    {
      reference: 'Joshua 1:9',
      text: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',
    },
    {
      reference: 'Micah 6:8',
      text: 'He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God.',
    },
  ],
  women: [
    {
      reference: 'Proverbs 31:25',
      text: 'She is clothed with strength and dignity; she can laugh at the days to come.',
    },
    {
      reference: 'Psalm 46:5',
      text: 'God is within her, she will not fall; God will help her at break of day.',
    },
    {
      reference: 'Philippians 4:6–7',
      text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.',
    },
  ],
};

export const STORE_HUB_SCRIPTURE: StoreScripture = {
  reference: 'Colossians 3:17',
  text: 'And whatever you do, whether in word or deed, do it all in the name of the Lord Jesus, giving thanks to God the Father through him.',
};

export function getScripturesForMinistry(ministry: StoreMinistry): StoreScripture[] {
  return STORE_SCRIPTURES[ministry] ?? [];
}
