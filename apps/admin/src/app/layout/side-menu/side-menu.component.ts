import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface Menu {
  name: string;
  children?: { name: string; href: string }[];
}

const MENUS: Menu[] = [
  {
    name: '메인 홈 관리',
    children: [
      { name: '배너 관리', href: '/home/banners' },
    ],
  },
  {
    name: '고객센터 관리',
    children: [
      { name: '공지사항', href: '/customer/notice' },
      { name: 'FAQ', href: '/customer/faq' },
      { name: '1:1 문의하기', href: '/customer/inquiry' },
    ],
  },
  {
    name: '박람회 운영 관리',
    children: [
      { name: '박람회 정보 관리', href: '/expo/schedule' },
      { name: '참가 업체 관리', href: '/expo/exhibitor' },
      { name: '사전 등록 관리', href: '/expo/registration' },
    ],
  },

  {
    name: '갤러리/보도자료',
    children: [
      { name: '갤러리 관리', href: '/expo/gallery' },
      { name: '보도자료 관리', href: '/expo/press' },
    ],
  },
  {
    name: '사이트 관리',
    children: [
      { name: '회사 정보', href: '/site/business' },
      { name: '약관/안내', href: '/site/terms' },
    ],
  },
];

@Component({
  selector: 'app-side-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-menu.component.html',
})
export class SideMenuComponent {
  menus = MENUS;
}
