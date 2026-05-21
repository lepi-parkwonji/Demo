import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ── Supabase 이미지 업로드 헬퍼 ───────────────────────────────

function getSupabaseClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL 또는 SUPABASE_SERVICE_KEY 환경변수가 없습니다.');
  return createClient(url, key);
}

async function ensureBucket(supabase: SupabaseClient, bucket: string) {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === bucket);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(bucket, { public: true });
    if (error) throw new Error(`버킷 생성 실패 (${bucket}): ${error.message}`);
    console.log(`  버킷 생성: ${bucket}`);
  }
}

async function uploadFromUrl(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
  sourceUrl: string,
): Promise<string> {
  const res = await fetch(sourceUrl);
  if (!res.ok) throw new Error(`이미지 다운로드 실패: ${sourceUrl}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') ?? 'image/jpeg';

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`업로드 실패 (${path}): ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ── Main ──────────────────────────────────────────────────────

async function main() {
  const supabase = getSupabaseClient();
  await ensureBucket(supabase, 'gallery');
  await ensureBucket(supabase, 'content');

  // 이미지 업로드 (picsum → Supabase)
  console.log('이미지 업로드 중...');
  const imgs = Object.fromEntries(
    await Promise.all(
      [
        ['fair1',  'gallery/seed/schedule-1.jpg',  'https://picsum.photos/seed/fair1/800/400'],
        ['fair2',  'gallery/seed/schedule-2.jpg',  'https://picsum.photos/seed/fair2/800/400'],
        ['fair3',  'gallery/seed/schedule-3.jpg',  'https://picsum.photos/seed/fair3/800/400'],
        ['fair4',  'gallery/seed/schedule-4.jpg',  'https://picsum.photos/seed/fair4/800/400'],
        ['fair5',  'gallery/seed/schedule-5.jpg',  'https://picsum.photos/seed/fair5/800/400'],
        ['gal1',   'gallery/seed/gallery-1.jpg',   'https://picsum.photos/seed/gal1/1200/800'],
        ['gal2',   'gallery/seed/gallery-2.jpg',   'https://picsum.photos/seed/gal2/1200/800'],
        ['gal3',   'gallery/seed/gallery-3.jpg',   'https://picsum.photos/seed/gal3/1200/800'],
        ['press1', 'gallery/seed/press-1.jpg',     'https://picsum.photos/seed/press1/1200/800'],
        ['press2', 'gallery/seed/press-2.jpg',     'https://picsum.photos/seed/press2/1200/800'],
      ].map(async ([key, path, url]) => [key, await uploadFromUrl(supabase, 'gallery', path, url)])
    )
  );
  console.log('✓ 이미지 업로드 완료');

  // ── Admin ──────────────────────────────────────────────
  const password = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD || 'admin1234', 10);
  await prisma.admin.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, username: 'admin', password, displayName: '관리자' },
  });
  console.log('✓ Admin seeded');

  // ── Schedule (박람회 일정) ─────────────────────────────
  const schedules = await Promise.all([
    prisma.schedule.upsert({
      where: { id: 1 }, update: {},
      create: {
        id: 1, fairName: '2026 서울 국제 박람회', year: 2026, region: '서울',
        type: '종합', status: 'ONGOING',
        startTime: new Date('2026-06-01'), endTime: new Date('2026-06-05'),
        place: '코엑스 A홀', entranceFee: 10000,
        details: '국내 최대 규모의 종합 박람회입니다.',
        notice: '주차는 사전 예약 필수입니다.',
        thumbnail: imgs['fair1'], isExposed: true,
      },
    }),
    prisma.schedule.upsert({
      where: { id: 2 }, update: {},
      create: {
        id: 2, fairName: '2026 부산 산업 박람회', year: 2026, region: '부산',
        type: '산업', status: 'PENDING',
        startTime: new Date('2026-09-10'), endTime: new Date('2026-09-14'),
        place: '벡스코 제1전시장', entranceFee: 5000,
        details: '부산 지역 산업 혁신 전시회입니다.',
        thumbnail: imgs['fair2'], isExposed: true,
      },
    }),
    prisma.schedule.upsert({
      where: { id: 3 }, update: {},
      create: {
        id: 3, fairName: '2025 인천 IT 박람회', year: 2025, region: '인천',
        type: 'IT', status: 'FINISHED',
        startTime: new Date('2025-11-01'), endTime: new Date('2025-11-04'),
        place: '송도 컨벤시아', entranceFee: 0,
        details: '최신 IT 트렌드와 스타트업을 만나는 자리입니다.',
        thumbnail: imgs['fair3'], visitorCount: 12000, isExposed: true,
      },
    }),
    prisma.schedule.upsert({
      where: { id: 4 }, update: {},
      create: {
        id: 4, fairName: '2026 대구 헬스케어 박람회', year: 2026, region: '대구',
        type: '헬스케어', status: 'PENDING',
        startTime: new Date('2026-10-20'), endTime: new Date('2026-10-23'),
        place: '대구 엑스코', entranceFee: 8000,
        details: '의료·헬스케어 전문 기업들이 참여하는 전시회입니다.',
        thumbnail: imgs['fair4'], isExposed: false,
      },
    }),
    prisma.schedule.upsert({
      where: { id: 5 }, update: {},
      create: {
        id: 5, fairName: '2026 광주 문화 박람회', year: 2026, region: '광주',
        type: '문화', status: 'PENDING',
        startTime: new Date('2026-08-05'), endTime: new Date('2026-08-08'),
        place: '김대중컨벤션센터', entranceFee: 3000,
        details: '지역 문화예술과 창작자들이 함께하는 박람회입니다.',
        thumbnail: imgs['fair5'], isExposed: true,
      },
    }),
  ]);
  console.log('✓ Schedules seeded');

  // ── Exhibitor (참가 업체) ─────────────────────────────
  await Promise.all([
    prisma.exhibitor.upsert({
      where: { id: 1 }, update: {},
      create: {
        id: 1, scheduleId: schedules[0].id,
        companyName: '(주)테크노바', representativeName: '김민준',
        businessRegNumber: '123-45-67890', managerName: '이지은',
        contact: '010-1234-5678', email: 'contact@technova.kr',
        boothType: 'PREMIUM', boothCount: 2, options: ['단상 3kw', '인터넷 1회선'],
        totalFee: 5100000, status: 'APPROVED', boothNumber: 'A-101',
      },
    }),
    prisma.exhibitor.upsert({
      where: { id: 2 }, update: {},
      create: {
        id: 2, scheduleId: schedules[0].id,
        companyName: '스마트솔루션즈', representativeName: '박서연',
        businessRegNumber: '234-56-78901', managerName: '최현우',
        contact: '010-2345-6789', email: 'info@smartsol.co.kr',
        boothType: 'SHELL_SCHEME', boothCount: 1, options: ['스포트라이트 2개'],
        totalFee: 1530000, status: 'WAITING_PAYMENT',
      },
    }),
    prisma.exhibitor.upsert({
      where: { id: 3 }, update: {},
      create: {
        id: 3, scheduleId: schedules[0].id,
        companyName: '그린에너지코리아', representativeName: '정하늘',
        businessRegNumber: '345-67-89012', managerName: '윤소희',
        contact: '010-3456-7890', email: 'green@gekorea.com',
        boothType: 'SPACE_ONLY', boothCount: 3, options: ['삼상 10kw', '급배수'],
        totalFee: 3350000, status: 'APPROVED', boothNumber: 'B-205',
      },
    }),
    prisma.exhibitor.upsert({
      where: { id: 4 }, update: {},
      create: {
        id: 4, scheduleId: schedules[1].id,
        companyName: '바이오메드텍', representativeName: '오준혁',
        businessRegNumber: '456-78-90123', managerName: '강나연',
        contact: '010-4567-8901', email: 'biz@biomedtek.kr',
        boothType: 'SHELL_SCHEME', boothCount: 2, options: ['인터넷 1회선'],
        totalFee: 3100000, status: 'PENDING',
      },
    }),
    prisma.exhibitor.upsert({
      where: { id: 5 }, update: {},
      create: {
        id: 5, scheduleId: schedules[1].id,
        companyName: '퓨처모빌리티', representativeName: '임태양',
        businessRegNumber: '567-89-01234', managerName: '신예린',
        contact: '010-5678-9012', email: 'info@futuremobility.kr',
        boothType: 'PREMIUM', boothCount: 1, options: ['단상 3kw'],
        totalFee: 2550000, status: 'PENDING',
      },
    }),
  ]);
  console.log('✓ Exhibitors seeded');

  // ── Registration (사전등록) ───────────────────────────
  await Promise.all([
    prisma.registration.upsert({ where: { reservationNo: 'REG-20260001' }, update: {}, create: { reservationNo: 'REG-20260001', name: '홍길동', contact: '010-1111-2222', fairName: '2026 서울 국제 박람회', marketingConsent: true } }),
    prisma.registration.upsert({ where: { reservationNo: 'REG-20260002' }, update: {}, create: { reservationNo: 'REG-20260002', name: '김영희', contact: '010-2222-3333', fairName: '2026 서울 국제 박람회', marketingConsent: false } }),
    prisma.registration.upsert({ where: { reservationNo: 'REG-20260003' }, update: {}, create: { reservationNo: 'REG-20260003', name: '이철수', contact: '010-3333-4444', fairName: '2026 부산 산업 박람회', marketingConsent: true } }),
    prisma.registration.upsert({ where: { reservationNo: 'REG-20260004' }, update: {}, create: { reservationNo: 'REG-20260004', name: '박민지', contact: '010-4444-5555', fairName: '2026 부산 산업 박람회', marketingConsent: true } }),
    prisma.registration.upsert({ where: { reservationNo: 'REG-20260005' }, update: {}, create: { reservationNo: 'REG-20260005', name: '최수진', contact: '010-5555-6666', fairName: '2026 광주 문화 박람회', marketingConsent: false } }),
  ]);
  console.log('✓ Registrations seeded');

  // ── Gallery (갤러리 / 보도자료) ───────────────────────
  await Promise.all([
    prisma.gallery.upsert({ where: { id: 1 }, update: {}, create: { id: 1, category: 'GALLERY', title: '2025 인천 IT 박람회 현장 사진', content: '<p>2025 인천 IT 박람회의 생생한 현장을 담았습니다.</p>', imageUrl: imgs['gal1'], eventName: '2025 인천 IT 박람회', shootingDate: '2025-11-02', keywords: ['박람회', 'IT', '인천'], isPinned: true, isExposed: true } }),
    prisma.gallery.upsert({ where: { id: 2 }, update: {}, create: { id: 2, category: 'GALLERY', title: '서울 국제 박람회 개막식', content: '<p>성황리에 개최된 개막식 행사 장면입니다.</p>', imageUrl: imgs['gal2'], eventName: '2026 서울 국제 박람회', shootingDate: '2026-06-01', keywords: ['개막식', '서울'], isPinned: false, isExposed: true } }),
    prisma.gallery.upsert({ where: { id: 3 }, update: {}, create: { id: 3, category: 'PRESS', title: '[뉴스1] 2025 인천 IT 박람회, 역대 최대 규모 개최', content: '<p>뉴스1이 보도한 인천 IT 박람회 관련 기사입니다.</p>', imageUrl: imgs['press1'], eventName: '2025 인천 IT 박람회', keywords: ['보도자료', '뉴스1'], isPinned: true, isExposed: true } }),
    prisma.gallery.upsert({ where: { id: 4 }, update: {}, create: { id: 4, category: 'PRESS', title: '[연합뉴스] 2026 서울 국제 박람회 참가 업체 모집 시작', content: '<p>연합뉴스가 전하는 2026 서울 국제 박람회 소식입니다.</p>', imageUrl: imgs['press2'], keywords: ['보도자료', '연합뉴스'], isPinned: false, isExposed: true } }),
    prisma.gallery.upsert({ where: { id: 5 }, update: {}, create: { id: 5, category: 'GALLERY', title: '부스 설치 및 준비 현장', content: '<p>박람회 개막 전 부스 설치 현장을 담은 사진입니다.</p>', imageUrl: imgs['gal3'], eventName: '2026 서울 국제 박람회', shootingDate: '2026-05-31', keywords: ['부스', '설치'], isPinned: false, isExposed: false } }),
  ]);
  console.log('✓ Gallery seeded');

  // ── Notice (공지사항) ─────────────────────────────────
  await Promise.all([
    prisma.notice.upsert({ where: { id: 1 }, update: {}, create: { id: 1, title: '[필독] 2026 서울 국제 박람회 참가 신청 안내', content: '<p>2026 서울 국제 박람회 참가 신청이 시작되었습니다. 신청 기간은 4월 30일까지입니다.</p>', isPinned: true, isExposed: true, authorId: 1 } }),
    prisma.notice.upsert({ where: { id: 2 }, update: {}, create: { id: 2, title: '홈페이지 개편 안내', content: '<p>새로운 홈페이지가 오픈되었습니다. 불편 사항은 문의 게시판을 이용해주세요.</p>', isPinned: false, isExposed: true, authorId: 1 } }),
    prisma.notice.upsert({ where: { id: 3 }, update: {}, create: { id: 3, title: '박람회 관람 시 주의사항 안내', content: '<p>반려동물 동반 입장은 불가하며, 음식물 반입을 제한합니다.</p>', isPinned: false, isExposed: true, authorId: 1 } }),
    prisma.notice.upsert({ where: { id: 4 }, update: {}, create: { id: 4, title: '2025 인천 IT 박람회 결과 보고서 공개', content: '<p>총 방문객 12,000명을 기록한 2025 인천 IT 박람회 결과 보고서를 공개합니다.</p>', isPinned: false, isExposed: true, authorId: 1 } }),
    prisma.notice.upsert({ where: { id: 5 }, update: {}, create: { id: 5, title: '[임시] 시스템 점검 안내 (비공개)', content: '<p>2026-05-20 02:00~04:00 시스템 점검이 예정되어 있습니다.</p>', isPinned: false, isExposed: false, authorId: 1 } }),
  ]);
  console.log('✓ Notices seeded');

  // ── FAQ ───────────────────────────────────────────────
  await Promise.all([
    prisma.faq.upsert({ where: { id: 1 }, update: {}, create: { id: 1, question: '박람회 입장권은 어디서 구매하나요?', answer: '현장 매표소에서 구매하거나 온라인 사전등록을 통해 할인 입장권을 받으실 수 있습니다.', isPinned: true, isExposed: true, authorId: 1 } }),
    prisma.faq.upsert({ where: { id: 2 }, update: {}, create: { id: 2, question: '부스 신청은 어떻게 하나요?', answer: '홈페이지 내 참가 신청 페이지에서 신청서를 작성하시면 담당자가 검토 후 연락드립니다.', isPinned: true, isExposed: true, authorId: 1 } }),
    prisma.faq.upsert({ where: { id: 3 }, update: {}, create: { id: 3, question: '주차 시설이 있나요?', answer: '전시장 내 주차장이 운영되며, 사전 예약 시 할인이 적용됩니다. 대중교통 이용을 권장합니다.', isPinned: false, isExposed: true, authorId: 1 } }),
    prisma.faq.upsert({ where: { id: 4 }, update: {}, create: { id: 4, question: '단체 관람 할인이 있나요?', answer: '20명 이상 단체 관람 시 30% 할인이 적용됩니다. 사전에 유선 또는 이메일로 문의해주세요.', isPinned: false, isExposed: true, authorId: 1 } }),
    prisma.faq.upsert({ where: { id: 5 }, update: {}, create: { id: 5, question: '어린이 동반 입장이 가능한가요?', answer: '만 6세 미만 어린이는 보호자 동반 시 무료입장 가능합니다.', isPinned: false, isExposed: true, authorId: 1 } }),
  ]);
  console.log('✓ FAQs seeded');

  // ── Inquiry (1:1 문의) ────────────────────────────────
  await Promise.all([
    prisma.inquiry.upsert({ where: { id: 1 }, update: {}, create: { id: 1, title: '부스 신청 후 변경이 가능한가요?', content: '부스 신청 완료 후 부스 타입을 변경하고 싶은데 가능한지 문의드립니다.', authorName: '홍길동', isAnswered: true, answer: '입금 전 단계에서는 변경이 가능합니다. 담당자에게 연락주시면 도와드리겠습니다.', isExposed: false } }),
    prisma.inquiry.upsert({ where: { id: 2 }, update: {}, create: { id: 2, title: '사전등록 취소는 어떻게 하나요?', content: '사전등록 후 개인 사정으로 취소하고 싶습니다. 방법을 알려주세요.', authorName: '김영희', isAnswered: false, isExposed: false } }),
    prisma.inquiry.upsert({ where: { id: 3 }, update: {}, create: { id: 3, title: '장애인 편의시설이 있나요?', content: '휠체어 이용자도 편하게 관람할 수 있는 시설이 마련되어 있는지 궁금합니다.', authorName: '이철수', isAnswered: true, answer: '전시장 내 휠체어 대여 서비스와 장애인 전용 주차구역이 운영됩니다.', isExposed: false } }),
    prisma.inquiry.upsert({ where: { id: 4 }, update: {}, create: { id: 4, title: '세금계산서 발행 요청', content: '부스 결제 후 세금계산서 발행을 요청드립니다. 사업자번호 000-00-00000입니다.', authorName: '박서연', isAnswered: false, isSecret: true, isExposed: false } }),
    prisma.inquiry.upsert({ where: { id: 5 }, update: {}, create: { id: 5, title: '협찬 및 광고 문의', content: '박람회 관련 협찬 및 광고 협업에 관심이 있습니다. 담당자 연락처를 알 수 있을까요?', authorName: '최현우', isAnswered: true, answer: '협찬 문의는 biz@example.com으로 연락주시면 안내해드리겠습니다.', isExposed: false } }),
  ]);
  console.log('✓ Inquiries seeded');

  // ── SiteSettings ─────────────────────────────────────
  await prisma.siteSettings.upsert({
    where: { id: 1 }, update: {},
    create: { id: 1, businessName: '(주)박람회코리아', businessNo: '123-45-67890', ceoName: '홍길동', address: '서울특별시 강남구 테헤란로 123', phone: '02-1234-5678', email: 'info@fairkorea.kr' },
  });
  console.log('✓ SiteSettings seeded');

  // ── SitePages ─────────────────────────────────────────
  await Promise.all([
    prisma.sitePage.upsert({ where: { slug: 'terms' }, update: {}, create: { slug: 'terms', title: '이용약관', content: '<h2>제1조 (목적)</h2><p>본 약관은 박람회코리아가 운영하는 웹사이트 이용에 관한 조건을 규정합니다.</p><h2>제2조 (정의)</h2><p>서비스란 박람회코리아가 제공하는 모든 온라인 서비스를 의미합니다.</p>' } }),
    prisma.sitePage.upsert({ where: { slug: 'privacy' }, update: {}, create: { slug: 'privacy', title: '개인정보처리방침', content: '<h2>1. 개인정보 수집 항목</h2><p>이름, 연락처, 이메일을 수집합니다.</p><h2>2. 수집 목적</h2><p>박람회 사전등록 및 참가 신청 처리를 위해 수집합니다.</p>' } }),
    prisma.sitePage.upsert({ where: { slug: 'visitor-guide' }, update: {}, create: { slug: 'visitor-guide', title: '관람 안내', content: '<h2>관람 시간</h2><p>오전 10시 ~ 오후 6시 (마지막 입장 오후 5시 30분)</p><h2>입장료</h2><p>일반: 10,000원 / 학생: 5,000원 / 만 6세 미만: 무료</p>' } }),
    prisma.sitePage.upsert({ where: { slug: 'marketing-consent' }, update: {}, create: { slug: 'marketing-consent', title: '마케팅 활용 동의', content: '<h2>마케팅 정보 수신 동의</h2><p>박람회 행사 소식, 이벤트 및 프로모션 안내를 위해 수집된 연락처를 활용합니다.</p>' } }),
  ]);
  console.log('✓ SitePages seeded');

  // ── Sequence 재설정 (시드 데이터의 명시적 ID로 인한 시퀀스 불일치 방지) ──
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Admin"', 'id'), COALESCE(MAX(id), 0)) FROM "Admin"`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Banner"', 'id'), COALESCE(MAX(id), 0)) FROM "Banner"`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Customer"', 'id'), COALESCE(MAX(id), 0)) FROM "Customer"`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Exhibitor"', 'id'), COALESCE(MAX(id), 0)) FROM "Exhibitor"`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Faq"', 'id'), COALESCE(MAX(id), 0)) FROM "Faq"`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Gallery"', 'id'), COALESCE(MAX(id), 0)) FROM "Gallery"`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Inquiry"', 'id'), COALESCE(MAX(id), 0)) FROM "Inquiry"`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Notice"', 'id'), COALESCE(MAX(id), 0)) FROM "Notice"`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Registration"', 'id'), COALESCE(MAX(id), 0)) FROM "Registration"`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Schedule"', 'id'), COALESCE(MAX(id), 0)) FROM "Schedule"`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"SitePage"', 'id'), COALESCE(MAX(id), 0)) FROM "SitePage"`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"SiteSettings"', 'id'), COALESCE(MAX(id), 0)) FROM "SiteSettings"`;
  console.log('✓ Sequences reset');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
