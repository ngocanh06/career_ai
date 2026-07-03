import React from 'react';
import DashboardLayout from '../DashboardLogged/DashboardLayout';
import Topbar from '../DashboardLogged/Topbar';

export default function AiCvAnalysis() {
  return (
    <DashboardLayout>
      <Topbar user={{ name: 'Ngọc Anh' }} />
    </DashboardLayout>
  );
}
