// 구조화 데이터(JSON-LD)를 <script>로 심는다. 서버 컴포넌트라 정적 HTML에 그대로 들어가서
// 크롤러가 JS 실행 없이 읽는다.
export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
